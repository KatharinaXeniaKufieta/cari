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

  // Attempt to display a progress bar & remaining time to the user
  this.progressVisible = ko.observable(false);
  this.progress = ko.observable(0).extend({ deferred: true });
  this.maxProgress = ko.observable(0).extend({deferred: true});
  this.timeLeft = ko.observable(0).extend({ deferred: true });;

  // Variables that are going to be set by the custom binding
  this.seamcarver = {};
  this.energyPicture = {};

  this.resizeCanvases = ko.observableArray([]);
  this.canvases = ko.observableArray([]);
  // imageData is the data saved in the file model.js
  imageData.forEach(function(data) {
    if (data.id === 'originalResize') {
      // Resize-Canvas to get number pixels that need to be resized
      var canvas = new ResizeImage(data, self.numberVerticalSeams, self.numberHorizontalSeams);
      canvas.imageLoaded = ko.observable(false);
      self.resizeCanvases.push(canvas);
    } else {
      var canvas = new CanvasImage(data);
      canvas.imageLoaded = ko.observable(false);
      self.canvases.push(canvas);
    }
  });

  this.numberVerticalSeams.subscribe(function(oldValue) {
    console.log("Vertical seams old value: " + oldValue);
  }, null, "beforeChange");

  this.numberHorizontalSeams.subscribe(function(oldValue) {
    console.log("Horizontal seams old value: " + oldValue);
  }, null, "beforeChange");

  this.numberVerticalSeams.subscribe(function(newValue) {
    console.log("Vertical seams new value: " + newValue);
    self.resizeCanvases()[0].manualAdjustImage('width', self.numberVerticalSeams(), self.numberHorizontalSeams());
  });

  this.numberHorizontalSeams.subscribe(function(newValue) {
    console.log("Horizontal seams new value: " + newValue);
    self.resizeCanvases()[0].manualAdjustImage('height', self.numberVerticalSeams(), self.numberHorizontalSeams());
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
  reader.onload = (function(canvases, resizeCanvases) {
    return function(e) {
      resizeCanvases.forEach(function(canvas) {
        canvas.imageLoaded(false);
        canvas.clearCanvas();
        if (canvas.id === 'originalResize') {
          canvas.image.src = e.target.result;
          canvas.imageLoaded(true);
        }
      });
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
  })(self.canvases(), self.resizeCanvases());
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

  // Attempt to display a progress bar & remaining time to the user
  // TODO: Finish this, maybe you need to put this.seamcarver.resizeWidth in a
  // webworker? Not sure. Tried requestAnimationFrame and similar without
  // success.
  // this.progressVisible(true);
  this.maxProgress(0);
  this.progress(0);
  this.seamcarver.prepareResize()
  var start = Date.now();
  console.log('time now: ' + start);
  var seams = 0;
  while (seams < this.numberVerticalSeams() + this.numberHorizontalSeams()) {
    seams = this.seamcarver.resize(this.numberVerticalSeams(), this.numberHorizontalSeams(), this.maxProgress, this.progress, this.timeLeft, seams);
    // console.log(this.maxProgress());
    // console.log(this.progress());
    // console.log(this.timeLeft());
    this.timeLeft(20);
  }
  var timeelapsed = Date.now() - start;
  console.log('time needed: ' + timeelapsed);
  var avgTime = timeelapsed/(this.numberVerticalSeams() + this.numberHorizontalSeams());
  console.log('time needed/ #seams: ' + avgTime);

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
  this.progressVisible(false);
  this.maxProgress(0);
  this.progress(0);
  // this.timeLeft(0);
}

/******************
 * Apply Bindings *
 ******************/
window.onload = function() {
  ko.applyBindings(new ViewModel());
};
