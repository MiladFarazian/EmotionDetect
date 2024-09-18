const video = document.getElementById("video");

const basePath = window.location.pathname.includes('EmotionDetect') ? '/EmotionDetect/models' : '/models';

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri(basePath),
  faceapi.nets.faceLandmark68Net.loadFromUri(basePath),
  faceapi.nets.faceRecognitionNet.loadFromUri(basePath),
  faceapi.nets.faceExpressionNet.loadFromUri(basePath),
]).then(startVideo);

function startVideo() {
  const video = document.getElementById('video');
  const loadingGif = document.getElementById('loading');

  // Start video stream
  navigator.mediaDevices.getUserMedia({ video: {} }).then(stream => {
    video.srcObject = stream;

    // Hide loading GIF and show video when data starts loading
    video.addEventListener('loadeddata', () => {
      loadingGif.style.display = 'none';  // Hide loading GIF
      video.style.display = 'block';      // Show the video
    });
  });
}

video.addEventListener("play", () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);
  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
  }, 100);
});
