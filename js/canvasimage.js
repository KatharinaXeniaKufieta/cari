/**********************
 * Class: CanvasImage *
 **********************/
/**
 * Creates CanvasImage from the data saved in model.js. Handles a canvas
 * in the display, including the displayed image, caption, context.
 * @constructor
 * @param {object} data - Data saved in model.js.
 */
var CanvasImage = function(data) {
  var self = this;
  // Knockout observables of an Image
  this.caption = ko.observable(data.caption);
  this.canvasWidth = ko.observable(30);
  this.canvasHeight = ko.observable(30);

  // Regular variables of an Image
  this.id = data.id;
  this.image = new Image();

  // Variables that are going to be set by the custom binding
  this.canvas = {};
  this.context = {};
  this.resize = false;
};

/**
 * Scales the uploaded image to fit the maximum size of the canvas. Keeps the
 * ratio between width and height.
 */
CanvasImage.prototype.scaleImage = function() {
  // normal: 417 x 246
  // resize: 517 x 346
  var ratio = this.image.height / this.image.width;
  if (this.image.height > this.image.width &&
      this.image.height > MAX_CANVAS_SIZE) {
    this.canvasHeight(MAX_CANVAS_SIZE);
    this.canvasWidth(this.canvasHeight() / ratio);
  } else if (this.image.width >= this.image.height &&
             this.image.width > MAX_CANVAS_SIZE) {
    this.canvasWidth(MAX_CANVAS_SIZE);
    this.canvasHeight(ratio * this.canvasWidth());
  } else {
    this.canvasHeight(this.image.height);
    this.canvasWidth(this.image.width);
  }
};

/**
 * Draws the image to the canvas. Handles both images that are an instance of
 * Image or an instance of ImageData.
 */
CanvasImage.prototype.drawImage = function() {
  if (this.image instanceof Image) {
    this.context.fillStyle = 'rgb(235, 240, 255)';
    this.context.fillRect(0, 0, this.canvasWidth(), this.canvasHeight());
    this.context.drawImage(this.image, 0, 0, this.image.width, this.image.height, 0, 0, this.canvasWidth(), this.canvasHeight());
  } else if (this.image instanceof ImageData) {
    // console.log('draw ImageData');
    this.context.putImageData(this.image, 0, 0);
  }
};

/**
 * Clears the canvas.
 */
CanvasImage.prototype.clearCanvas = function() {
  this.context.fillStyle = 'rgb(235, 240, 255)';
  this.context.fillRect(0, 0, this.canvasWidth(), this.canvasHeight());
};

/**********************
 * Class: ResizeImage *
 **********************/
/**
 * Creates ResizeImage from the data saved in model.js. Handles a canvas
 * in the display, including the displayed image, caption, context. This is a
 * subclass from CanvasImage, with the additional property of being resizeable
 * by dragging and dropping the corners and borders of the image.
 * @constructor
 * @param {object} data - Data saved in model.js.
 */
function ResizeImage (data, numberVerticalSeams, numberHorizontalSeams) {
  CanvasImage.call(this, data);
  // The (resized) image is defined by the upper left and
  // lower right point called: topLeft and bottomRight
  this.topLeftX = 0;
  this.topLeftY = 0;
  this.bottomRightX = NaN;
  this.bottomRightY = NaN;
  this.cursorPosition = "Out";
  this.mouseDownX = NaN;
  this.mouseDownY = NaN;
  this.mouseUpX = NaN;
  this.mouseUpY = NaN;
  this.resizing = false;
  this.originalWidth = 0;
  this.originalHeight = 0;
  // Knockout observables
  this.numVerticalSeams = numberVerticalSeams;
  this.numHorizontalSeams = numberHorizontalSeams;
}

/**
 * Scales the uploaded image to fit the maximum size of the canvas. Keeps the
 * ratio between width and height. Considers that there is a CANVAS_MARGIN
 * surrounding the image within the canvas.
 */
ResizeImage.prototype.scaleImage = function() {
  // normal: 417 x 246
  // resize: 517 x 346
  var ratio = this.image.height / this.image.width;
  if (this.image.height > this.image.width &&
      this.image.height > MAX_CANVAS_SIZE) {
    this.canvasHeight(MAX_CANVAS_SIZE);
    this.canvasWidth(this.canvasHeight() / ratio);
  } else if (this.image.width >= this.image.height &&
             this.image.width > MAX_CANVAS_SIZE) {
    this.canvasWidth(MAX_CANVAS_SIZE);
    this.canvasHeight(ratio * this.canvasWidth());
  } else {
    this.canvasHeight(this.image.height);
    this.canvasWidth(this.image.width);
  }
  // Adjust for the canvas margin. The canvas margin
  // allows the user to resize the image by drag & drop of corners
  // and borders easier. That is because the margin gives more room to use
  // the mouse for resizing.
  this.topLeftX = CANVAS_MARGIN;
  this.topLeftY = CANVAS_MARGIN;
  this.bottomRightX = this.canvasWidth() + CANVAS_MARGIN;
  this.bottomRightY = this.canvasHeight() + CANVAS_MARGIN;
  this.originalWidth = this.bottomRightX - this.topLeftX;
  this.originalHeight = this.bottomRightY - this.topLeftY;
  this.canvasWidth(this.canvasWidth() + 2 * CANVAS_MARGIN);
  this.canvasHeight(this.canvasHeight() + 2 * CANVAS_MARGIN);
  // console.log('topLeft (x,y): (' + this.topLeftX + ', ' + this.topLeftY + ')');
  // console.log('bottomRight (x,y): (' + this.bottomRightX + ', ' + this.bottomRightY + ')');
};

/**
 * Draws the image to the canvas. Handles both images that are an instance of
 * Image or an instance of ImageData.
 */
ResizeImage.prototype.drawImage = function() {
  if (this.image instanceof Image) {
    this.context.fillStyle = 'rgb(235, 240, 255)';
    this.context.fillRect(0, 0, this.canvasWidth(), this.canvasHeight());
    this.context.drawImage(this.image, 0, 0, this.image.width, this.image.height, this.topLeftX, this.topLeftY, this.canvasWidth() - 2 * CANVAS_MARGIN, this.canvasHeight() - 2 * CANVAS_MARGIN);
  } else if (this.image instanceof ImageData) {
    // console.log('draw ImageData');
    this.context.putImageData(this.image, 0, 0);
  }
};

/**
 * Clears the canvas.
 */
ResizeImage.prototype.clearCanvas = function() {
  this.context.fillStyle = 'rgb(235, 240, 255)';
  this.context.fillRect(0, 0, this.canvasWidth(), this.canvasHeight());
}

/**
 * Event handler that recognizes in which area the cursor enters the image.
 * It indicates the option to resize the image to the user:
 * The mouse cursor changes shape into diagonal, horizontal or vertical
 * resizing.
 * @param {object} data - Data from the event.
 * @param {object} evt - Event, here: mousemove.
 */
ResizeImage.prototype.enablePulling = function(data, evt) {
  // console.log('resizeImage enablePulling');
  var canvasOffsetTop = this.canvas.offsetTop;
  var canvasOffsetLeft = this.canvas.offsetLeft;
  // console.log('canvasOffsetTop: ' + canvasOffsetTop);
  // console.log('canvasOffsetLeft: ' + canvasOffsetLeft);

  // relativeMouse is the relative position of the mouse within the canvas.
  var relativeMouseX = evt.pageX - canvasOffsetLeft;
  var relativeMouseY = evt.pageY - canvasOffsetTop;
  // console.log('evt.pageX: ' + evt.pageX);
  // console.log('evt.pageY: ' + evt.pageY);
  // console.log('relativeMouseX: ' + relativeMouseX);
  // console.log('relativeMouseY: ' + relativeMouseY);
  if (!this.resizing && relativeMouseX > this.topLeftX && relativeMouseY > this.topLeftY && relativeMouseX < this.bottomRightX && relativeMouseY < this.bottomRightY) {
    if (relativeMouseX - this.topLeftX < 20 && relativeMouseY - this.topLeftY < 20) {
      console.log('Upper left corner');
      this.canvas.style.cursor = "nwse-resize";
    } else if (Math.abs(relativeMouseX - this.bottomRightX) < 20 && Math.abs(relativeMouseY - this.bottomRightY) < 20) {
      console.log('Bottom right corner');
      this.canvas.style.cursor = "nwse-resize";
    } else if (relativeMouseX - this.topLeftX < 20 && Math.abs(relativeMouseY - this.bottomRightY) < 20) {
      console.log('Bottom left corner');
      this.canvas.style.cursor = "nesw-resize";
    } else if (Math.abs(relativeMouseX - this.bottomRightX) < 20 && relativeMouseY - this.topLeftY < 20) {
      console.log('Upper right corner');
      this.canvas.style.cursor = "nesw-resize";
    } else if (relativeMouseX - this.topLeftX > 20 && Math.abs(relativeMouseX - this.bottomRightX) > 20 && relativeMouseY - this.topLeftY < 20) {
      console.log('Upper border');
      this.canvas.style.cursor = "ns-resize";
    } else if (relativeMouseX - this.topLeftX > 20 && Math.abs(relativeMouseX - this.bottomRightX) > 20 && Math.abs(relativeMouseY - this.bottomRightY) < 20) {
      console.log('Bottom border');
      this.canvas.style.cursor = "ns-resize";
    } else if (relativeMouseX - this.topLeftX < 20 && Math.abs(relativeMouseY - this.bottomRightY) > 20 && relativeMouseY - this.topLeftY > 20) {
      console.log('Left border');
      this.canvas.style.cursor = "ew-resize";
    } else if (Math.abs(relativeMouseX - this.bottomRightX) < 20 && Math.abs(relativeMouseY - this.bottomRightY) > 20 && relativeMouseY - this.topLeftY > 20) {
      console.log('Right border');
      this.canvas.style.cursor = "ew-resize";
    }
  } else if (!this.resizing) {
    this.canvas.style.cursor = "auto";
  }
};

/**
 * Event handler that records the method of resizing (diagonally, horizontally
 * or vertically) and the start position of the mouse that is important for
 * calculation of how much the image must be resized.
 * @param {object} data - Data from the event.
 * @param {object} evt - Event, here: mousedown.
 */
ResizeImage.prototype.getResize = function(data, evt) {
  // console.log('resizeImage getResize');
  this.resizing = true;
  this.mouseDownX = evt.pageX;
  this.mouseDownY = evt.pageY;
  var canvasOffsetTop = this.canvas.offsetTop;
  var canvasOffsetLeft = this.canvas.offsetLeft;

  // relativeMouse is the relative position of the mouse within the canvas.
  var relativeMouseX = evt.pageX - canvasOffsetLeft;
  var relativeMouseY = evt.pageY - canvasOffsetTop;


  // This will activate resizing either diagonally, horizontally or vertically.
  // It sets the flag 'cursorPosition' that indicates where the user is resizing,
  // from any of the four corners, or the four borders.
  if (relativeMouseX - this.topLeftX < 20 && relativeMouseY - this.topLeftY < 20) {
    this.canvas.style.cursor = "nwse-resize";
    this.cursorPosition = "UpperLeftCorner";
  } else if (Math.abs(relativeMouseX - this.bottomRightX) < 20 && Math.abs(relativeMouseY - this.bottomRightY) < 20) {
    this.canvas.style.cursor = "nwse-resize";
    this.cursorPosition = "BottomRightCorner";
  } else if (relativeMouseX - this.topLeftX < 20 && Math.abs(relativeMouseY - this.bottomRightY) < 20) {
    this.canvas.style.cursor = "nesw-resize";
    this.cursorPosition = "BottomLeftCorner";
  } else if (Math.abs(relativeMouseX - this.bottomRightX) < 20 && relativeMouseY - this.topLeftY < 20) {
    this.canvas.style.cursor = "nesw-resize";
    this.cursorPosition = "UpperRightCorner";
  } else if (relativeMouseX - this.topLeftX > 20 && Math.abs(relativeMouseX - this.bottomRightX) > 20 && relativeMouseY - this.topLeftY < 20) {
    this.canvas.style.cursor = "ns-resize";
    this.cursorPosition = "UpperBorder";
  } else if (relativeMouseX - this.topLeftX > 20 && Math.abs(relativeMouseX - this.bottomRightX) > 20 && Math.abs(relativeMouseY - this.bottomRightY) < 20) {
    this.canvas.style.cursor = "ns-resize";
    this.cursorPosition = "BottomBorder";
  } else if (relativeMouseX - this.topLeftX < 20 && Math.abs(relativeMouseY - this.bottomRightY) > 20 && relativeMouseY - this.topLeftY > 20) {
    this.canvas.style.cursor = "ew-resize";
    this.cursorPosition = "LeftBorder";
  } else if (Math.abs(relativeMouseX - this.bottomRightX) < 20 && Math.abs(relativeMouseY - this.bottomRightY) > 20 && relativeMouseY - this.topLeftY > 20) {
    this.canvas.style.cursor = "ew-resize";
    this.cursorPosition = "RightBorder";
  }
};

/**
 * Event handler that records the position of the mouse when the user let go of
 * the mousebutton. This position is used to calculate how much the image has to
 * be resized.
 * @param {object} data - Data from the event.
 * @param {object} evt - Event, here: mouseup.
 */
ResizeImage.prototype.resizeImage = function(data, evt) {
  // console.log('resizeImage resizeImage');
  this.mouseUpX = evt.pageX;
  this.mouseUpY = evt.pageY;
  var upper = false;
  var left = false;
  var right = false;
  var bottom = false;
  switch (this.cursorPosition) {
    case "UpperLeftCorner":
      upper = true;
      left = true;
      break;
    case "UpperRightCorner":
      upper = true;
      right = true;
      break;
    case "BottomLeftCorner":
      bottom = true;
      left = true;
      break;
    case "BottomRightCorner":
      bottom = true;
      right = true;
      break;
    case "BottomBorder":
      bottom = true;
      break;
    case "UpperBorder":
      upper = true;
      break;
    case "LeftBorder":
      left = true;
      break;
    case "RightBorder":
      right = true;
      break;

    default:
      break;
  }
  if (upper) {
    this.topLeftY += this.mouseUpY - this.mouseDownY;
    this.topLeftY = Math.max(this.topLeftY, CANVAS_MARGIN);
  }
  if (bottom) {
    this.bottomRightY += this.mouseUpY - this.mouseDownY;
    this.bottomRightY = Math.min(this.bottomRightY, this.canvasHeight() - CANVAS_MARGIN);
  }
  if (left) {
    this.topLeftX += this.mouseUpX - this.mouseDownX;
    this.topLeftX = Math.max(this.topLeftX, CANVAS_MARGIN);
  }
  if (right) {
    this.bottomRightX += this.mouseUpX - this.mouseDownX;
    this.bottomRightX = Math.min(this.bottomRightX, this.canvasWidth() - CANVAS_MARGIN);
  }

  this.context.fillStyle = 'rgb(207, 214, 217)';
  this.context.fillRect(CANVAS_MARGIN, CANVAS_MARGIN, this.canvasWidth() - CANVAS_MARGIN * 2 + 1, this.canvasHeight() - CANVAS_MARGIN * 2 + 1);
  var newWidth = this.bottomRightX - this.topLeftX;
  var newHeight = this.bottomRightY - this.topLeftY;
  this.context.drawImage(this.image, 0, 0, this.image.width, this.image.height, this.topLeftX, this.topLeftY, newWidth, newHeight);
  // Set number of vertical and horizontal seams
  this.numVerticalSeams(this.originalWidth - newWidth);
  this.numHorizontalSeams(this.originalHeight - newHeight);
  this.resizing = false;
};


/**
 * Event handler that records the position of the mouse when the user let go of
 * the mousebutton. This position is used to calculate how much the image has to
 * be resized.
 * @param {object} data - Data from the event.
 * @param {object} evt - Event, here: mouseup.
 */
ResizeImage.prototype.manualAdjustImage = function(flag, numVerticalSeams, numHorizontalSeams) {
  if (flag !== 'width' && flag !== 'height') {
    console.log(flag);
    throw new WrongFlagException();
  }
  var currentWidth = this.bottomRightX - this.topLeftX;
  var currentHeight = this.bottomRightY - this.topLeftY;
  if ((flag === 'width' && currentWidth !== this.originalWidth - numVerticalSeams) ||
      (flag === 'height' && currentHeight !== this.originalHeight - numHorizontalSeams)) {
    console.log('currentHeight: ' + currentHeight);
    console.log('currentWidth: ' + currentWidth);
    console.log(this.originalHeight - numHorizontalSeams);
    console.log(this.originalWidth - numVerticalSeams);
    this.topLeftX = CANVAS_MARGIN;
    this.topLeftY = CANVAS_MARGIN;
    this.bottomRightX = this.originalWidth - numVerticalSeams + CANVAS_MARGIN;
    this.bottomRightY = this.originalHeight - numHorizontalSeams + CANVAS_MARGIN;
    this.context.fillStyle = 'rgb(207, 214, 217)';
    this.context.fillRect(CANVAS_MARGIN, CANVAS_MARGIN, this.canvasWidth() - CANVAS_MARGIN * 2 + 1, this.canvasHeight() - CANVAS_MARGIN * 2 + 1);
    var newWidth = this.bottomRightX - this.topLeftX;
    var newHeight = this.bottomRightY - this.topLeftY;
    this.context.drawImage(this.image, 0, 0, this.image.width, this.image.height, this.topLeftX, this.topLeftY, newWidth, newHeight);
  } else {
    console.log('unnecessary to change image size because this was not a manual resize');
  }
};

/**************
  * Exceptions *
  **************/
function WrongFlagException() {
  this.message = "Flag is neither width nor height";
};
