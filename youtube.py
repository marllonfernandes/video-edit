from pytube import YouTube
yt = YouTube('https://www.youtube.com/watch?v=YckFv7QYuEM').streams.filter(progressive=True, file_extension='mp4').order_by('resolution').desc().first().download(filename="video.mp4")