var CanvasImage = function(data) {
  var self = this;
  // Knockout observables of an Image
  this.caption = ko.observable(data.caption);
  this.canvasWidth = ko.observable(30);
  this.canvasHeight = ko.observable(30);

  // Regular variables of an Image
  this.image = new Image();
  this.imagegraph = {};

  // Variables that are going to be set by the custom binding
  this.canvas = {};
  this.context = {};
};

CanvasImage.prototype.drawImage = function() {
  if (this.image instanceof Image) {
    this.context.drawImage(this.image, 0, 0, this.image.width, this.image.height, 0, 0, this.canvasWidth(), this.canvasHeight());
    // This drawing compensates for a given canvas margin
    // this.context.drawImage(this.image, 0, 0, this.imageWidth, this.imageHeight, this.topLeftX, this.topLeftY, this.canvasWidth() - 2 * CANVAS_MARGIN, this.canvasHeight() - 2 * CANVAS_MARGIN);
  } else if (this.image instanceof ImageData) {
    this.context.putImageData(this.image, 0, 0);
  }
};

// Scales the image accordingly to the maximum canvas size
// so it will fit into the canvas and keep it's ratio between
// width and height.
CanvasImage.prototype.scaleImage = function() {
  var ratio = this.image.height / this.image.width;
  if (this.image.height > this.image.width &&
      this.image.height > MAX_CANVAS_SIZE) {
    this.canvasHeight(MAX_CANVAS_SIZE);
    this.canvasWidth(this.canvasHeight() / ratio);
  } else if (this.image.width > this.image.height &&
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

/*******************
 * Custom Bindings *
 *******************/
ko.bindingHandlers.canvas = {
  update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
    // First get the latest data that we're bound to
    var value = valueAccessor();

    // Next, whether or not the supplied model property is observable, get its current value
    var valueUnwrapped = ko.unwrap(value);
    console.log('valueUnwrapped (imageLoaded): ' + valueUnwrapped);

    // Grab some more data from another binding property
    var width = allBindings().attr.width();
    var height = allBindings().attr.height();

    // viewModel equals the CanvasImage
    // Now manipulate the DOM element
    viewModel.canvas = $(element)[0];
    viewModel.context = viewModel.canvas.getContext('2d');

    viewModel.scaleImage();
    viewModel.drawImage();
  }
}

/**************
 * ViewModel  *
 **************/

var ViewModel = function() {
  var self = this;
  this.verticalNumberSeams = ko.observable(0);

  this.canvases = ko.observableArray([]);
  imageData.forEach(function(data) {
    var canvas = new CanvasImage(data);
    // image.getContext();
    // image.drawImage();
    canvas.imageLoaded = ko.observable(false);
    self.canvases.push(canvas);
  });
};

// Read the file in (given by the user)
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
        canvas.image.src = e.target.result;
        // set the size of the canvas accordingly to the size of the image
        canvas.canvasWidth(canvas.image.width);
        canvas.canvasHeight(canvas.image.height);
        // draw the image in the canvas
        canvas.drawImage();
      })
    };
  })(self.canvases());
  // Start reading the data from file, when ready call the
  // reader.onload function.
  reader.readAsDataURL(file);
};

ViewModel.prototype.startResizing = function() {
  console.log('start resizing, number pixels width: ' + this.verticalNumberSeams());
}

/******************
 * Apply Bindings *
 ******************/

window.onload = function() {
  ko.applyBindings(new ViewModel());
};

