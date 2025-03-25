import fs from "fs";
// import ytdl from "ytdl-core";
import ytdl from "@distube/ytdl-core";
import path from "path";
import { execSync } from "node:child_process";
// import { existsSync, rmdirSync, unlinkSync } from "node:fs";

const rootDir = process.cwd();

// Get video from YouTube
export async function getYouTube(videoUrl) {
  const info = await ytdl.getInfo(videoUrl);
  const title = formatString(info.videoDetails.title);
  const videoPath = path.join(rootDir, "data", `${title}.mp4`);

  return new Promise((resolve, reject) => {
    if (videoUrl === undefined) {
      return reject({ status: false, message: "URL do vídeo não informada" });
    }

    ytdl(videoUrl, {
      quality: "highestvideo",
      filter: "videoandaudio",
    })
      .pipe(fs.createWriteStream(videoPath))
      .on("finish", () => {
        resolve({ status: true, videoPath, title });
      })
      .on("error", (err) => {
        reject({ status: false, videoPath: err.message, title: null });
      });
  });
}

// Extract audio from video
export async function extractionVideoToAudio(videoPath, title) {
  const directory = path.dirname(videoPath);
  // const fileName = path.basename(videoPath);
  const fileNameVideo = `${directory}/${title}.mp4`;
  const audioPath = path.join(
    directory,
    `${title}.${process.env.AUDIO_EXTENSION}`
  );

  // check if the file exists and delete
  // await deleteFiles(directory);
  // rename file
  // fs.renameSync(videoPath, fileNameVideo);

  // Extract audio from video
  const commandLine =
    process.env.AUDIO_EXTENSION === "mp3"
      ? `ffmpeg -i ${fileNameVideo} -f mp3 -ab 320k -vn ${audioPath}`
      : `ffmpeg -i ${fileNameVideo} -ar 48000 -ac 2 -c:a pcm_s24le ${audioPath}`;

  await execSync(commandLine);

  // check if the file exists
  if (fs.existsSync(videoPath)) {
    // delete file
    fs.unlinkSync(videoPath);
    console.log(`${title}.mp4 deleted successfully.`);
  }

  // if (process.env.AUDIO_TONE) {
  //   await changeAudioTone(audioPath, process.env.AUDIO_TONE);
  // }
  // await separateAudio(audioPath);

  // rename files to title
  // fs.renameSync(fileNameVideo, videoPath);
  // fs.renameSync(audioPath, `${directory}/${title}.${process.env.AUDIO_EXTENSION}`);

  return audioPath;
}

export function deleteContents(directoryPath) {
  if (fs.existsSync(directoryPath)) {
      fs.readdirSync(directoryPath).forEach(file => {
          const curPath = path.join(directoryPath, file);
          if (fs.lstatSync(curPath).isDirectory()) {
              deleteDirectory(curPath); // Recursivamente deleta subdiretórios
          } else {
              fs.unlinkSync(curPath); // Deleta arquivos
          }
      });
  }
}

function deleteDirectory(directoryPath) {
  deleteContents(directoryPath);
  if (directoryPath !== '/caminho/do/diretorio/data') { // Garante que o diretório root não seja removido
      fs.rmdirSync(directoryPath); // Remove o diretório após estar vazio
  }
}

// Separate audio
export async function separateAudio(audioPath) {
  const directory = path.dirname(audioPath);

  let auxMp3 = "";
  let division = "-n htdemucs_6s"; //"--two-stems=vocals"
  
  // demucs -n htdemucs_6s --mp3 --mp3-bitrate=320 audio.mp3

  if (process.env.AUDIO_EXTENSION === "mp3") {
    auxMp3 = "--mp3 --mp3-bitrate=320";
  }

  // `spleeter separate -o ${output} -p spleeter:5stems ${audioName}`

  await execSync(
    `demucs ${division} ${auxMp3} ${audioPath} --out ${directory}`
  );
}

// Change audio tone
export async function changeAudioTone(audioPath, tone) {
  const directory = path.dirname(audioPath);
  const fileName = path.basename(audioPath);
  const nameOnly = path.basename(fileName, path.extname(fileName));
  const tones = [
    { tone: "-1/2", value: "pitch -50", desc: "meio_tom_abaixo" },
    { tone: "+1/2", value: "pitch 50", desc: "meio_tom_acima" },
    { tone: "-1", value: "pitch -100", desc: "um_tom_abaixo" },
    { tone: "+1", value: "pitch 100", desc: "um_tom_acima" },
    { tone: "-2", value: "pitch -200", desc: "dois_tom_abaixo" },
    { tone: "+2", value: "pitch 200", desc: "dois_tom_acima" },
    { tone: "-3", value: "pitch -300", desc: "tres_tom_abaixo" },
    { tone: "+3", value: "pitch 300", desc: "tres_tom_acima" },
  ];

  const toneToFind = tones.find((t) => t.tone === tone);
  const fileNameOut = `${directory}/${nameOnly}_${toneToFind.desc}.${process.env.AUDIO_EXTENSION}`;

  // +50 → Aumenta meio tom (50 cents).
  // -50 → Abaixa meio tom (-50 cents).

  // Outros ajustes de tonalidade com SoX:

  // Tom	Valor (pitch)
  // Subir 1 tom	+100
  // Subir 2 tons	+200
  // Subir 3 tons	+300
  // Descer 1 tom	-100
  // Descer 2 tons	-200
  // Descer 3 tons	-300

  await execSync(`sox ${audioPath} ${fileNameOut} ${toneToFind.value}`);
  return fileNameOut;
}

function formatString(str) {
  return str
    .normalize("NFD") // Separa acentos dos caracteres
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^a-zA-Z0-9 ]/g, "") // Remove caracteres especiais
    .replace(/\s+/g, "_") // Substitui espaços por _
    .toLowerCase(); // Converte para minúsculas
}