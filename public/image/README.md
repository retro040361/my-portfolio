TO embed video, you should convert the video through ffmpeg first:
ffmpeg -i input_video.mp4 -vcodec libx264 -crf 23 -preset fast -acodec aac output_video.mp4