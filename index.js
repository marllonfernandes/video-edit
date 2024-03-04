import { execSync } from "node:child_process";
import { existsSync, rmdirSync, unlinkSync } from "node:fs";
import getVideo from "./getVideo.js"

(async () => {

    if (process.argv.length < 3) {
        console.error("Por favor, forneça um parâmetro.");
        process.exit(1); // Encerre o script com um código de erro
    }
    const UrlVideo = process.argv[2]
    const output = 'output'
    const dirOut = `${output}/music`
    const videoName = 'video.mp4'
    const audioName = 'music.mp3'

    if (!UrlVideo) {
        console.info("Por favor, Preencha um valor como parâmetro, não é permitido deixa-lo vazio");
        process.exit(1); // Encerre o script com um código de erro
    }

    // deleta o diretorio music dentro de output
    if (existsSync(dirOut)) {
        await rmdirSync(dirOut, { recursive: true })
    }

    // deleta os arquivos mp4 e mp3
    if (existsSync(videoName)) {
        await unlinkSync(videoName)
    }

    if (existsSync(audioName)) {
        await unlinkSync(audioName)
    }
    
    // faz o download video youtube
    // await execSync("python youtube.py");
    const { status, message } = await getVideo(UrlVideo)

    if (!status) {
        console.log("Erro ao fazer o download do video: ", message)
        return
    }

    // extrai o audio do video
    await execSync(`ffmpeg -i ${videoName} -f mp3 -ab 192000 -vn ${audioName}`);

    // faz a separação das faixas de audio
    // -p spleeter:4stems
    // -p spleeter:5stems
    await execSync(`spleeter separate -o ${output} -p spleeter:2stems ${audioName}`);

    // converte wav para mp3
    await execSync(`ffmpeg -i ${dirOut}/accompaniment.wav -vn -ar 44100 -ac 2 -b:a 192k ${dirOut}/accompaniment.mp3`);
    await execSync(`ffmpeg -i ${dirOut}/vocals.wav -vn -ar 44100 -ac 2 -b:a 192k ${dirOut}/vocals.mp3`);

    console.log("Processo finalizado com sucesso!")

})()