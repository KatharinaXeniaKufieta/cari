var CanvasImage = function(data) {
  var self = this;
  // Knockout observables of an Image
  this.id = ko.observable(data.id);
  this.caption = ko.observable(data.caption);
  this.imageWidth = ko.observable(30);
  this.imageHeight = ko.observable(30);

  this.image = new Image();
  this.image.src = data.src;
};

CanvasImage.prototype.setImage = function(imageSource) {
  this.image.src = imageSource;
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
    console.log('valueUnwrapped (loadedImage): ' + valueUnwrapped);

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
  this.images = ko.observableArray([]);
  images.forEach(function(image) {
    var image = new CanvasImage(image);
    // image.getContext();
    // image.drawImage();
    image.loadedImage = ko.observable(false);
    self.images.push(image);
  });

  // Read the file in (given by the user)
  self.handleFile = function(file) {
    // The FileReader object lets web applications asynchronously
    // read the contents of files (or raw data buffers).
    var reader = new FileReader();
    // The FileReader.onload function contains an event handler
    // executed when the load event is fired, which happens when
    // content read with readAsDataURL is available.
    reader.onload = (function(images) {
      return function(e) {
        images.forEach(function(img) {
          img.image.src = e.target.result;
          // set the size of the canvas accordingly to the size of the image
          img.imageWidth(img.image.width);
          img.imageHeight(img.image.height);
          // draw the image in the canvas
          img.context.drawImage(img.image, 0, 0);
        })
      };
    })(self.images());
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

