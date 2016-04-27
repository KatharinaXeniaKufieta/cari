// Show image in canvas
var doc = document,
    win = window,
    canvas = doc.createElement('canvas'),
    canvasDiv = doc.getElementById('canvas-div'),
    ctx = canvas.getContext('2d'),
    image = new Image(),
    file = {};

var MAX_CANVAS_SIZE = 700;

var scaleImage = function(image) {
  var ratio = image.height / image.width;
  if (image.height > image.width &&
      image.height > MAX_CANVAS_SIZE) {
    canvas.height = MAX_CANVAS_SIZE;
    canvas.width = canvas.height / ratio;
  } else if (image.width > image.height &&
             image.width > MAX_CANVAS_SIZE) {
    canvas.width = MAX_CANVAS_SIZE;
    canvas.height = ratio * canvas.width;
  } else {
    canvas.width = image.width;
    canvas.height = image.height;
  }
}

// Set size of canvas accordingly to the image size
var setCanvasSize = function(canvas, image) {
  canvas.height = image.height;
  canvas.width = image.width;
}

var handleFiles = function() {
  file = this.files[0];
  console.log("file: " + file);
  console.log("this.files: " + this.files);

  var reader = new FileReader();
  reader.onload = (function(img) {
    return function(e) {
      img.src = e.target.result;
      scaleImage(img);
      ctx.drawImage(img, 0, 0, img.width, img.height,
                    0, 0, canvas.width, canvas.height);
    };
  })(image);
  reader.readAsDataURL(file);
  canvasDiv.appendChild(canvas);
};

var inputElement = document.getElementById('input');
inputElement.addEventListener("change", handleFiles, false);

console.log("image: " + image);



