export interface Channel {
  name: string;
  url: string;
}

export const channels: Channel[] = [
  {
    name: "Web Programming UNPAS",
    url: "https://www.youtube.com/c/WebProgrammingUNPAS",
  },
  {
    name: "Programmer Zaman Now",
    url: "https://www.youtube.com/c/ProgrammerZamanNow",
  },
  {
    name: "Kelas Terbuka",
    url: "https://www.youtube.com/user/faqihzamukhlish",
  },
  {
    name: "Sekolah Koding",
    url: "https://www.youtube.com/channel/UCpSPS5yLCxYRuZSrCx-eBjA",
  },
  { name: "Kawan Koding", url: "https://www.youtube.com/c/kawankoding" },
  {
    name: "Erico Darmawan Handoyo (Flutter)",
    url: "https://www.youtube.com/c/EricoDarmawanHandoyo",
  },
  {
    name: "Study With Student",
    url: "https://www.youtube.com/c/StudyWithStudentkuy",
  },
  {
    name: "LampungDev",
    url: "https://www.youtube.com/channel/UCR3WE0f21jWTVQng79a8HFw",
  },
  { name: "prawito hudoro", url: "https://www.youtube.com/c/prawitohudoro" },
  {
    name: "Galih Pratama",
    url: "https://www.youtube.com/c/GalihPratamaChannel",
  },
  { name: "BuildWith Angga", url: "https://www.youtube.com/c/BuildWithAngga" },
  { name: "Codepolitan", url: "https://www.youtube.com/c/Codepolitan" },
  { name: "Parsinta", url: "https://www.youtube.com/channel/UCPlEbdgWOXkKEEl7dhBxs4Q"},
];

export const ytChannelsMessage = (): string => {
  let message = "Daftar channel Youtube belajar pemrograman:\n\n";

  channels.forEach((chan: Channel) => {
    message += `→ <a href="${chan.url}">${chan.name}</a>\n`;
  });

  message += `\nAda yang lain? bantu tambahkan <a href="https://github.com/upkoding/telegram-bot/blob/main/functions/src/resources/yt_channels.ts">disini</a>.`;
  return message;
};
