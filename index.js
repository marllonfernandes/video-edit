import { spawn, exec, execSync } from "node:child_process";

// const ls = spawn("ls", ["-lh", "/usr"]);
// ffmpeg -i video.mp4 -f mp3 -ab 192000 -vn music.mp3

function getYouTube() {
    
    const ls = spawn("python3", ["youtube.py"]);
    
    ls.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
    });
    
    ls.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });
    
    ls.on("close", (code) => {
      console.log(`child process exited with code ${code}`);
    });

}

function extractAudio() {
    
    const ls = spawn("ffmpeg", [
      "-i",
      "video.mp4",
      "-f",
      "mp3",
      "-ab",
      "192000",
      "-vn",
      "music.mp3",
    ]);

    ls.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
    });

    ls.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });

    ls.on("close", (code) => {
      console.log(`child process exited with code ${code}`);
    });

}

async function removeVoiceAudio() {
    
    // await execSync('ffmpeg -i music.mp3 -af pan="stereo|c0=c0|c1=-1*c1" -ac 1 musicX.mp3');
    // await execSync("spleeter separate -i music.mp3 -p spleeter:2stems -o ./output");

}

// getYouTube()
// extractAudio()
// removeVoiceAudio()