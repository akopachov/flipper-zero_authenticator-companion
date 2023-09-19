/// <reference types="w3c-image-capture/" />

export async function takeScreenShot(source: string) {
  const videoEl = document.createElement('video');
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      mandatory: {
        chromeMediaSource: process.platform == 'win32' ? 'desktop' : 'screen',
        chromeMediaSourceId: source,
      },
    },
  });
  videoEl.srcObject = stream;
  await new Promise(resolve => (videoEl.onloadedmetadata = resolve));
  await videoEl.play();
  const track = stream.getVideoTracks()[0];
  const imageCapture = new ImageCapture(track);
  const frame = await imageCapture.grabFrame();
  videoEl.pause();
  track.stop();
  videoEl.remove();
  return frame;
}
