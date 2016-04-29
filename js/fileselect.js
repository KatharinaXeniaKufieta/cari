/**********************************************
 * Handle image input. Show image in canvas.
 *********************************************/
var MAX_CANVAS_SIZE = 700,
    doc = document,
    win = window,
    image = new Image(),
    file = {},
    energyPicture = {};
var canvasOriginal = doc.createElement('canvas'),
    canvasResized = doc.createElement('canvas'),
    canvasEnergy = doc.createElement('canvas'),
    canvasPaths = doc.createElement('canvas'),
    canvasOriginalDiv = doc.getElementById('canvas-original'),
    canvasResizedDiv = doc.getElementById('canvas-resized'),
    canvasEnergyDiv = doc.getElementById('canvas-energy'),
    canvasPathsDiv = doc.getElementById('canvas-paths');

var ImageHandler = function(img, canvas, canvasDiv) {
  // this.canvas = doc.createElement('canvas');
  // this.canvasDiv = doc.getElementById('canvas-original');

  this.canvas = canvas;
  this.canvasDiv = canvasDiv;
  this.ctx = this.canvas.getContext('2d');

  this.height = img.height;
  this.width = img.width;

  this.image = img;
  this.imagegraph = {};

  this.init();
}

ImageHandler.prototype.init = function() {
  this.scaleImage();
}

ImageHandler.prototype.scaleImage = function() {
  var ratio = this.height / this.width;
  if (this.height > this.width &&
      this.height > MAX_CANVAS_SIZE) {
    this.canvas.height = MAX_CANVAS_SIZE;
    this.canvas.width = this.canvas.height / ratio;
  } else if (this.width > this.height &&
             this.width > MAX_CANVAS_SIZE) {
    this.canvas.width = MAX_CANVAS_SIZE;
    this.canvas.height = ratio * this.canvas.width;
  } else {
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }
}

ImageHandler.prototype.drawImage = function() {
  if (this.image instanceof Image) {
    this.ctx.drawImage(this.image, 0, 0, this.width, this.height,
                      0, 0, this.canvas.width, this.canvas.height);
  } else if (this.image instanceof ImageData) {
    this.ctx.putImageData(this.image, 0, 0);
  }
  this.canvasDiv.appendChild(this.canvas);
}

/**********************************************
 * Handle Image upload from user
 *********************************************/
var handleFiles = function() {
  file = this.files[0];
  console.log("file: " + file);
  console.log("this.files: " + this.files);

  var reader = new FileReader();
  reader.onload = (function(img) {
    return function(e) {
      img.src = e.target.result;
      var imageHandlerOriginal = new ImageHandler(img, canvasOriginal,
                                         canvasOriginalDiv);
      imageHandlerOriginal.drawImage();
      // Save image in custom Image object
      imagegraph = new Imagegraph(imageHandlerOriginal.image, imageHandlerOriginal.ctx);
      energyPicture = imagegraph.energyPicture();
      var imageHandlerEnergy = new ImageHandler(energyPicture,
                                                canvasEnergy,
                                                canvasEnergyDiv);
      imageHandlerEnergy.drawImage();
    };
  })(image);
  reader.readAsDataURL(file);
};

var inputElement = document.getElementById('input');
inputElement.addEventListener("change", handleFiles, false);

