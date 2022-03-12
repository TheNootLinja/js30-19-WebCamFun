const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');
const effectChoices = document.querySelectorAll('.effects input');

let imageEffect = 'none';

const getVideo = () => {
  navigator.mediaDevices.getUserMedia({video: true, audio: false})
  .then(localMediaStream => {
    video.srcObject = localMediaStream;
    video.play();
  })
  .catch(err => {
    alert('Without access to your webcam, I cant really do anything ya doof!')
  })
}

const paintToCanvas = () => {
  const height = video.videoHeight;
  const width = video.videoWidth;
  canvas.height = height;
  canvas.width = width;
  
  return setInterval(() => {
    ctx.drawImage(video, 0, 0, width, height);
    let pixels = ctx.getImageData(0,0,width,height);
    switch(imageEffect) {
      case 'Red Effect':
        pixels = redEffect(pixels);
        break;
      case 'RGB Split':
        pixels = rgbSplitEffect(pixels);
        break;
      case 'Green Screen':
        pixels = greenScreenEffect(pixels);
    };
    // ctx.globalAlpha = 0.1;
    ctx.putImageData(pixels, 0, 0)
  }, 16)
}

const takePhoto = () => {
  snap.currentTime = 0;
  snap.play();
  const image = canvas.toDataURL('image/jpeg');
  const imageLink = document.createElement('a');
  imageLink.href = image;
  imageLink.setAttribute('download', 'Beautiful Man');
  imageLink.innerHTML = `<img src="${imageLink.href}" alt="" />`
  strip.insertBefore(imageLink, strip.firstChild)
}

const redEffect = (pixels) => {
  for(let i = 0; i < pixels.data.length; i+=4){
    pixels.data[i] = pixels.data[i] + 100;
    pixels.data[i + 1] = pixels.data[i + 1] - 50;
    pixels.data[i + 2] = pixels.data[i + 2] * .5;
  }
  return pixels;
}

const rgbSplitEffect = (pixels) => {
  for(let i = 0; i < pixels.data.length; i+=4){
    pixels.data[i - 150] = pixels.data[i] + 100;
    pixels.data[i + 100] = pixels.data[i + 1] - 50;
    pixels.data[i - 150] = pixels.data[i + 2] * .5;
  }
  return pixels;
}

const greenScreenEffect = (pixels) => {
  const levels = {};

  document.querySelectorAll('.rgb input').forEach((input) => {
    levels[input.name] = input.value;
  });


  for(i = 0; i < pixels.data.length; i+=4) {
    red = pixels.data[i];
    green = pixels.data[i+1];
    blue = pixels.data[i+2];
    alpha = pixels.data[i+3];

    if(
      red >= levels.rmin
      && green >= levels.gmin
      && blue >= levels.bmin
      && red <= levels.rmax
      && green <= levels.gmax
      && blue <= levels.bmax
      ){
        pixels.data[i + 3] = 0;
    }
  }
  return pixels;
}

const switchEffect = (e) => {
  return imageEffect = e.target.value;
}

getVideo();

video.addEventListener('canplay', paintToCanvas);
effectChoices.forEach((effectChoice) => {
  effectChoice.addEventListener('click', switchEffect);
})