const { Responsive } = P5Template;

let video;
let faceapi;
let detections = [];

let flameOn = false;
let hasBlown = false;
let smokeParticles = [];

let messageDiv;
let inputBox;
let startBtn;

function setup() {
  const cnv = createCanvas(windowWidth, windowHeight);
  cnv.parent('canvas-container');

  // 비디오 캡처 설정
  video = createCapture(VIDEO);
  video.size(240, 180);
  video.hide();
  video.elt.style.display = 'none';

  // 얼굴 인식 옵션
  const options = {
    withLandmarks: true,
    withDescriptors: false,
    withExpressions: false,
  };
  faceapi = ml5.faceApi(video, options, () => faceapi.detect(gotFace));

  messageDiv = select('#message');
  inputBox = select('#wish');
  startBtn = select('#start-button');
  startBtn.mousePressed(startCandle);
}

function gotFace(err, result) {
  if (result) detections = result;
  setTimeout(() => faceapi.detect(gotFace), 150);
}

function draw() {
  const vidW = 240;
  const vidH = 180;
  const vidX = width / 2.9 - vidW / 2;
  const vidY = 40;
  image(video, vidX, vidY, vidW, vidH);

  //촛불 위치
  const candleX = width / 2.9;
  const candleY = height * 0.2;
  drawCandle(candleX, candleY);

  //입 벌림 감지 후 촛불 끄기
  if (flameOn && mouthOpen()) {
    flameOn = false;
    hasBlown = true;
    messageDiv.html(`"${inputBox.value()}" 을(를) 위한 촛불을 껐어요 🎉`);
  }

  //연기 파티클 생성 하고 업데이트 하기
  if (!flameOn && hasBlown) {
    if (frameCount % 5 === 0) {
      smokeParticles.push(new Smoke(candleX, candleY - 50));
    }
    for (let i = smokeParticles.length - 1; i >= 0; i--) {
      if (smokeParticles[i].update()) smokeParticles.splice(i, 1);
    }
  }
}

function drawCandle(x, y) {
  push();
  //몸통
  fill('#FFDDAA');
  noStroke();
  rect(x - 15, y, 30, 80, 10);
  //심지
  fill(50);
  rect(x - 2, y - 40, 4, 40);
  //불꽃
  if (flameOn) {
    fill(255, 150, 0);
    ellipse(x, y - 50 + random(-2, 2), 20, 30);
  }
  pop();
}

function mouthOpen() {
  if (detections.length === 0) return false;
  const m = detections[0].parts.mouth;
  const topLip = m[13];
  const bottomLip = m[19];
  const d = dist(topLip._x, topLip._y, bottomLip._x, bottomLip._y);
  return d > 8;
}

function startCandle() {
  flameOn = true;
  hasBlown = false;
  smokeParticles = [];
  messageDiv.html('');
}

//Smoke 클래스 정의
class Smoke {
  constructor(x, y) {
    this.x = x + random(-5, 5);
    this.y = y;
    this.alpha = 255;
    this.size = random(10, 20);
    this.speed = random(0.5, 1.5);
  }
  update() {
    this.y -= this.speed;
    this.alpha -= 2;
    this.display();
    return this.alpha <= 0;
  }
  display() {
    noStroke();
    fill(200, 200, 200, this.alpha);
    ellipse(this.x, this.y, this.size);
  }
}
