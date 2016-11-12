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
};


/**
 * Scales the uploaded image to fit the maximum size of the canvas. Keeps the
 * ratio between width and height.
 */
CanvasImage.prototype.scaleImage = function() {
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

  // this.topLeftX = CANVAS_MARGIN;
  // this.topLeftY = CANVAS_MARGIN;
  // this.bottomRightX = this.canvasWidth();
  // this.bottomRightY = this.canvasHeight();
  // this.canvasWidth(this.canvasWidth() + CANVAS_MARGIN);
  // this.canvasHeight(this.canvasHeight() + CANVAS_MARGIN);
};

/**
 * Draws the image to the canvas. Handles both images that are an instance of
 * Image or an instance of ImageData.
 */
CanvasImage.prototype.drawImage = function() {
  if (this.image instanceof Image) {
    console.log('draw Image');
    this.context.drawImage(this.image, 0, 0, this.image.width, this.image.height, 0, 0, this.canvasWidth(), this.canvasHeight());
    // This drawing compensates for a given canvas margin
    // this.context.drawImage(this.image, 0, 0, this.imageWidth, this.imageHeight, this.topLeftX, this.topLeftY, this.canvasWidth() - 2 * CANVAS_MARGIN, this.canvasHeight() - 2 * CANVAS_MARGIN);
  } else if (this.image instanceof ImageData) {
    console.log('draw ImageData');
    this.context.putImageData(this.image, 0, 0);
  }
};

/**
 * Clears the canvas.
 */
CanvasImage.prototype.clearCanvas = function() {
  this.context.fillStyle = 'rgb(235, 240, 255)';
  this.context.fillRect(0, 0, this.canvasWidth(), this.canvasHeight());
}

/*******************
 * Custom Bindings *
 *******************/
/**
 * Custom Binding for handling a canvas and its context. This allows us to loop
 * over the data and create the canvases and their context dynamically with
 * Knockout.
 */
ko.bindingHandlers.canvas = {
  update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
    // First get the latest data that we're bound to
    var value = valueAccessor();

    // Next, whether or not the supplied model property is observable, get its
    // current value.
    var valueUnwrapped = ko.unwrap(value);

    // Grab some more data from another binding property
    var width = allBindings().attr.width();
    var height = allBindings().attr.height();

    // viewModel equals the CanvasImage
    // Now manipulate the DOM element
    viewModel.canvas = $(element)[0];
    viewModel.context = viewModel.canvas.getContext('2d');

    if (viewModel.imageLoaded()) {
      viewModel.scaleImage();
      viewModel.drawImage();
    }
  }
}

/**************
 * ViewModel  *
 **************/
/**
 * ViewModel based on Knockout, connects the view and the data. Handles the
 * uploading of the users image, their input for resizing the images, and
 * the display of the various images on their canvases.
 * @constructor
 */
var ViewModel = function() {
  var self = this;
  this.numberVerticalSeams = ko.observable(0);
  this.numberHorizontalSeams = ko.observable(0);

  // Variables that are going to be set by the custom binding
  this.seamcarver = {};
  this.energyPicture = {};

  this.canvases = ko.observableArray([]);
  // imageData is the data saved in the file model.js
  imageData.forEach(function(data) {
    var canvas = new CanvasImage(data);
    canvas.imageLoaded = ko.observable(false);
    self.canvases.push(canvas);
  });
};

/**
 * handleFile is called by an event listener when a change in the input
 * field for images is detected. Displays the uploaded image to the canvas and
 * constructs a Seamcarver object.
 * @param {object} file - File uploaded by the user.
 */
ViewModel.prototype.handleFile = function(file) {
  var self = this;
  // The FileReader object lets web applications asynchronously
  // read the contents of files (or raw data buffers).
  var reader = new FileReader();
  // The FileReader.onload function contains an event handler
  // executed when the load event is fired, which happens when
  // content read with readAsDataURL is available.
  reader.onload = (function(canvases) {
    return function(e) {
      canvases.forEach(function(canvas) {
        canvas.imageLoaded(false);
        canvas.clearCanvas();
        if (canvas.id === 'original') {
          // set the image source for the original image canvas
          // draw the image on the original image canvas
          canvas.image.src = e.target.result;
          canvas.imageLoaded(true);
          // start seamcarver from the uploaded image
          self.seamcarver = new Seamcarver(canvas);
        }
      });
    };
  })(self.canvases());
  // Start reading the data from file, when ready call the
  // reader.onload function.
  reader.readAsDataURL(file);
};

/**
 * Called when the Start Resizing button is clicked. Starts resizing the image
 * with the provided number of seams that the user wants to delete.
 */
ViewModel.prototype.startResizing = function() {
  var self = this;

  this.seamcarver.resizeWidth(this.numberVerticalSeams(), this.numberHorizontalSeams());

  this.canvases().forEach(function(canvas) {
    if (canvas.id === 'resizedEnergy') {
      canvas.imageLoaded(false);
      canvas.image = self.seamcarver.resizedEnergyPicture();
      canvas.imageLoaded(true);
    } else if (canvas.id === 'seams') {
      canvas.imageLoaded(false);
      canvas.image = self.seamcarver.pathPicture();
      canvas.imageLoaded(true);
    } else if (canvas.id === 'energySeams') {
      canvas.image = self.seamcarver.energyPathPicture();
      canvas.imageLoaded(false);
      canvas.imageLoaded(true);
    } else if (canvas.id === 'resized') {
      canvas.imageLoaded(false);
      canvas.image = self.seamcarver.resizedPicture();
      canvas.imageLoaded(true);
    }
  });
}

/******************
 * Apply Bindings *
 ******************/
window.onload = function() {
  ko.applyBindings(new ViewModel());
};
