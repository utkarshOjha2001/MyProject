const ffmpeg = await import('fluent-ffmpeg');


export const convertAudioToPCM = async (inputPath: string, outputPath: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .audioCodec('pcm_s16le')
      .audioFrequency(16000)
      .audioChannels(1)
      .format('wav')
      .on('end', () => resolve(true))
      .on('error', (err:any) => reject(err))
      .save(outputPath);
  });
};
