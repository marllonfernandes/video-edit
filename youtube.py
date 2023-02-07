from pytube import YouTube
yt = YouTube("inserir_url").streams.filter(progressive=True, file_extension="mp4").order_by("resolution").desc().first().download(filename="video.mp4")