import * as express from "express";
import * as functions from "firebase-functions";
import * as TelegramBot from "node-telegram-bot-api";
import * as Parser from "rss-parser";
import * as admin from "firebase-admin";

interface FeedEntry {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  author?: string;
  isoDate?: string;
}

// Youtube Feed parser
const parser: Parser = new Parser();

/**
 * convert `yt:video:abc123` into `abc123`
 * @param videoId <string>
 */
function parseVideoId(videoId: string): string {
  return videoId.replace("yt:video:", "");
}

/**
 * Check to see if specified video ID already shared (exists in shared_videos/)
 * @param videoId <string>, Youtube Video ID
 */
async function alreadyShared(videoId: string): Promise<boolean> {
  return admin
    .firestore()
    .doc(`shared_videos/${videoId}`)
    .get()
    .then((snap) => snap.exists)
    .catch(() => false);
}

/**
 * Save video to Firestore
 * @param video <any>, video object from feed
 */
async function saveVideo(video: FeedEntry): Promise<boolean> {
  const videoId = parseVideoId(video.id);
  return admin
    .firestore()
    .doc(`shared_videos/${videoId}`)
    .set(video)
    .then(() => true)
    .catch(() => false);
}

/**
 * Youtube webhook handler
 * @param bot <TelegramBot>
 * @param config <functions.config.Config>
 */
export default function (bot: TelegramBot, config: functions.config.Config) {
  // token verification middleware
  function verifyToken(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    if (!req.query.token || req.query.token !== config.youtube.webhook_token) {
      res.sendStatus(401);
      return;
    }
    next();
  }

  const router = express.Router();

  // https://pubsubhubbub.appspot.com verification endpoint
  // we need to return `hub.challenge` in response and 200 response code
  router.get(
    "/webhook/videos",
    verifyToken,
    (req: express.Request, res: express.Response) => {
      const query = req.query;
      res.status(200).send(query["hub.challenge"]);
    }
  );

  // https://pubsubhubbub.appspot.com callback endpoint
  router.post(
    "/webhook/videos",
    verifyToken,
    async (req: express.Request, res: express.Response) => {
      try {
        const feed = await parser.parseString(req.body);
        // share the first video only
        if (feed && feed.items.length > 0) {
          const video = feed.items[0] as FeedEntry;
          const videoId = parseVideoId(video.id);

          // isNew: published less than or equal 60 minutes ago
          const minuteSincePublished =
            (Date.now() - Date.parse(video.pubDate)) / (1000 * 60);
          const isNew = minuteSincePublished >= 60;
          const shared = await alreadyShared(videoId);
          
          console.log(`minSincePublished=${minuteSincePublished}, shared=${shared}`);
          
          // only share to group if its new AND never shared
          if (isNew && !shared) {
            // save before sharing
            const saved = await saveVideo(video);
            console.log(`Saving video: ${video.title}, saved=${saved}`);
            
            if (saved) {
              console.log(`Publishing video: ${video.title}`);

              await bot.sendMessage(
                config.telegram.admin_id,
                `Halo koders, cekidot video terbaru ya → <b><a href="${video.link}">${video.title}</a></b>`,
                { parse_mode: "HTML" }
              );
            }
          }
        }
      } catch (err) {
        console.log(err.message);
        res.sendStatus(500);
        return;
      }
      res.sendStatus(200);
    }
  );

  return router;
}
