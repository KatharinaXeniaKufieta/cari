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
