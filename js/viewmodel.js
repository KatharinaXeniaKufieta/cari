var CanvasImage = function(data) {
  var self = this;
  // Knockout observables of an Image
  this.caption = ko.observable(data.caption);
  this.canvasWidth = ko.observable(30);
  this.canvasHeight = ko.observable(30);

  // Regular variables of an Image
  this.image = new Image();
  this.imagegraph = {};
  this.id = data.id;

  // Variables that are going to be set by the custom binding
  this.canvas = {};
  this.context = {};
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

CanvasImage.prototype.clearCanvas = function() {
  this.context.fillStyle = 'rgb(235, 240, 255)';
  this.context.fillRect(0, 0, this.canvasWidth(), this.canvasHeight());
}

/*******************
 * Custom Bindings *
 *******************/
ko.bindingHandlers.canvas = {
  update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
    // First get the latest data that we're bound to
    var value = valueAccessor();

    // Next, whether or not the supplied model property is observable, get its
    // current value.
    var valueUnwrapped = ko.unwrap(value);
    console.log('valueUnwrapped (imageLoaded): ' + valueUnwrapped);

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
var ViewModel = function() {
  var self = this;
  this.verticalNumberSeams = ko.observable(0);

  this.canvases = ko.observableArray([]);
  imageData.forEach(function(data) {
    var canvas = new CanvasImage(data);
    canvas.imageLoaded = ko.observable(false);
    self.canvases.push(canvas);
  });
};

// handleFile is called by an event listener when a change in the input
// field for images is detected.
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
          // create the imagegraph from the uploaded image
          self.imagegraph = new Imagegraph(canvas);
          // calculate the energy picture
          self.energyPicture = self.imagegraph.energyPicture();
        }
      });
      canvases.forEach(function(canvas) {
        if (canvas.id === 'energy') {
          // draw the energy picture on the energy image
          canvas.image = self.energyPicture;
          canvas.imageLoaded(true);
        }
      });
    };
  })(self.canvases());
  // Start reading the data from file, when ready call the
  // reader.onload function.
  reader.readAsDataURL(file);
};

ViewModel.prototype.startResizing = function() {
  var self = this;
  console.log('start resizing, number pixels width: ' + this.verticalNumberSeams());
  this.pathPicture = this.imagegraph.pathPicture();
  this.energyPathPicture = this.imagegraph.energyPicture();
  for (var remove = 0; remove < this.verticalNumberSeams(); remove++) {
    var verticalMinPath = this.imagegraph.getVerticalMinPath();
    console.log("verticalMinPath: " + verticalMinPath);
    this.imagegraph.addPaths(this.pathPicture, verticalMinPath);
    this.imagegraph.addPaths(this.energyPathPicture, verticalMinPath);
    this.imagegraph.removePath(verticalMinPath);
  }
  this.canvases().forEach(function(canvas) {
    if (canvas.id === 'seams') {
      canvas.image = self.pathPicture;
      canvas.imageLoaded(true);
    } else if (canvas.id === 'energySeams') {
      canvas.image = self.energyPathPicture;
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
