import fs from "fs";
import path from "path";
import { getYouTube, extractionVideoToAudio, separateAudio, changeAudioTone, deleteContents } from "./handle.js";

const rootDir = process.cwd();
const filesDir = path.join(rootDir, "data");

(async () => {
  try {

    // Delete all files in the data folder
    // await deleteContents(filesDir);

    // Download the video from YouTube
    const { videoPath, title } = await getYouTube(process.env.YOUTUBE_URL);
    let audioPath = await extractionVideoToAudio(videoPath, title);

    if (fs.existsSync(audioPath)) {
      
      // Change audio tone
      if (process.env.AUDIO_TONE) {
        audioPath = await changeAudioTone(audioPath, process.env.AUDIO_TONE);
      }
      
      // Separate audio
      await separateAudio(audioPath);
      
    }    
    
  } catch (error) {
    console.log(error.message);
  }
})();