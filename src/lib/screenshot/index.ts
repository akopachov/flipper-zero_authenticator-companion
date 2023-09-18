/// <reference types="w3c-image-capture/" />

export async function takeScreenShot(source: string) {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: source,
      },
    },
  });
  const track = stream.getVideoTracks()[0];
  const imageCapture = new ImageCapture(track);
  const frame = await imageCapture.grabFrame();
  track.stop();
  return frame;
}
