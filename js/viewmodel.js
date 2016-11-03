var CanvasImage = function(data) {
  var self = this;
  // Knockout observables of an Image
  this.caption = ko.observable(data.caption);
  this.imageWidth = ko.observable(30);
  this.imageHeight = ko.observable(30);

  // Regular variables of an Image
  this.image = new Image();
};

CanvasImage.prototype.drawImage = function() {
  this.context.drawImage(this.image, 0, 0);
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

    viewModel.drawImage();
  }
}

/**************
 * ViewModel  *
 **************/

var ViewModel = function() {
  var self = this;
  this.canvases = ko.observableArray([]);
  imageData.forEach(function(data) {
    var canvas = new CanvasImage(data);
    // image.getContext();
    // image.drawImage();
    canvas.imageLoaded = ko.observable(false);
    self.canvases.push(canvas);
  });

  // Read the file in (given by the user)
  self.handleFile = function(file) {
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
          canvas.imageWidth(canvas.image.width);
          canvas.imageHeight(canvas.image.height);
          // draw the image in the canvas
          canvas.context.drawImage(canvas.image, 0, 0);
        })
      };
    })(self.canvases());
    // Start reading the data from file, when ready call the
    // reader.onload function.
    reader.readAsDataURL(file);
  };
};

/******************
 * Apply Bindings *
 ******************/

window.onload = function() {
  ko.applyBindings(new ViewModel());
};

