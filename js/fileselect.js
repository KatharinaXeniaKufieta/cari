/**********************************************
 * Handle image input. Show image in canvas.
 *********************************************/
var MAX_CANVAS_SIZE = 700,
    doc = document,
    win = window,
    image = new Image(),
    file = {},
    imagegraph = {},
    energyPicture = {},
    pathPicture = {},
    energyPathPicture = {};
var canvasOriginal = doc.createElement('canvas'),
    canvasResized = doc.createElement('canvas'),
    canvasEnergy = doc.createElement('canvas'),
    canvasPaths = doc.createElement('canvas'),
    canvasEnergyPaths = doc.createElement('canvas');
var canvasOriginalDiv = doc.getElementById('canvas-original'),
    canvasResizedDiv = doc.getElementById('canvas-resized'),
    canvasEnergyDiv = doc.getElementById('canvas-energy'),
    canvasPathsDiv = doc.getElementById('canvas-paths'),
    canvasEnergyPathsDiv = doc.getElementById('canvas-energy-paths');
var imageHandlerOriginal = {},
    imageHandlerResized = {},
    imageHandlerEnergy = {},
    imageHandlerPaths = {},
    imageHandlerEnergyPaths = {};
var verticalNumber = 0,
    horizontalNumber = 0;

/**********************************************
 * ImageHandler Class
 *********************************************/
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

/*
 * Initialize the image handler.
 */
ImageHandler.prototype.init = function() {
  this.scaleImage();
}

/*
 * Resize image to canvas size without distorting it.
 */
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

/*
 * Draw the image in the canvas.
 */
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
      imageHandlerOriginal = new ImageHandler(img, canvasOriginal,
                                              canvasOriginalDiv);
      imageHandlerOriginal.drawImage();
      // Save image in custom Image object
      console.log("image size: " + img.width + ", " + img.height)
      imagegraph = new Imagegraph(imageHandlerOriginal.image, imageHandlerOriginal.ctx);
      energyPicture = imagegraph.energyPicture();
      imageHandlerEnergy = new ImageHandler(energyPicture,
                                            canvasEnergy,
                                            canvasEnergyDiv);
      imageHandlerEnergy.drawImage();
      imageHandlerEnergy = new ImageHandler(energyPicture,
                                            canvasEnergy,
                                            canvasEnergyDiv);
      imageHandlerEnergy.drawImage();
    };
  })(image);
  reader.readAsDataURL(file);
};

/*
 * Set the number of vertical seams that will be deleted.
 */
var setNumberVerticalSeams = function() {
  verticalNumber = this.value;
  console.log("number entered: " + verticalNumber);
}

/*
 * Start resizing the Picture: Run the seam carver and show the results.
 */
var startResizing = function(e) {
  console.log("I am in startResizing and I will delete " + verticalNumber + " columns of pixels");
  pathPicture = imagegraph.pathPicture();
  energyPathPicture = imagegraph.energyPicture();
  for (var remove = 0; remove < verticalNumber; remove++) {
    var verticalMinPath = imagegraph.getVerticalMinPath();
    console.log("verticalMinPath: " + verticalMinPath);
    imagegraph.addPaths(pathPicture, verticalMinPath);
    imagegraph.addPaths(energyPathPicture, verticalMinPath);
    imagegraph.removePath(verticalMinPath);
  }
  imageHandlerPaths = new ImageHandler(pathPicture,
                                       canvasPaths,
                                       canvasPathsDiv);
  imageHandlerPaths.drawImage();

  imageHandlerEnergyPaths = new ImageHandler(energyPathPicture,
                                             canvasEnergyPaths,
                                             canvasEnergyPathsDiv);
  imageHandlerEnergyPaths.drawImage();
}


/**********************************************
 * Add event listeners to image input,
 * numberVerticalSeams and start button
 *********************************************/
var inputElement = document.getElementById('input');
inputElement.addEventListener("change", handleFiles, false);

var numVertSeamsElement = document.getElementById('numberVerticalSeams');
numVertSeamsElement.addEventListener("change", setNumberVerticalSeams, false);

var startElement = document.getElementById('start-resizing');
startElement.addEventListener("click", startResizing.bind(this), false);
