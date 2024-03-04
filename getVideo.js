import fs from "fs";
import ytdl from "ytdl-core";

export default async function getVideo(videoUrl) {
  return new Promise((resolve, reject) => {
    ytdl(videoUrl, {
      quality: "highest",
      filter: "audioandvideo",
    })
      .pipe(fs.createWriteStream(`video.mp4`))
      .on("finish", () => {
        resolve({ status: true, message: "ok" });
      })
      .on("error", (err) => {
        reject({ status: false, message: err.message });
      });
  });
}