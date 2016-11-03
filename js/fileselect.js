/**********************************************
 * Handle image input. Show image in canvas.
 *********************************************/
var imagegraph = {},
    energyPicture = {},
    pathPicture = {},
    energyPathPicture = {};
var imageHandlerOriginal = {},
    imageHandlerResized = {},
    imageHandlerEnergy = {},
    imageHandlerPaths = {},
    imageHandlerEnergyPaths = {};
var verticalNumber = 0,
    horizontalNumber = 0;

/**********************************************
 * Handle Image upload from user
 *********************************************/
// handleFiles is called by an even listener when a change in the input
// field for images is detected. The list of files handed over to this
// function can then be accessed through this.files, which is a FileList.
var handleFiles = function() {
  // The FileReader object lets web applications asynchronously
  // read the contents of files (or raw data buffers).
  var reader = new FileReader();
  // The FileReader.onload function contains an event handler
  // executed when the load event is fired, which happens when
  // content read with readAsDataURL is available.
  reader.onload = (function(img) {
    return function(e) {
      img.src = e.target.result;
      // Set canvas, get context, resize image to fit canvas, draw image
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
  // Start reading the data from file, when ready call the
  // reader.onload function.
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
// When the user uploads a file, that change is detected by this
// event listener. JavaScript hands over the list of files to the
// handleFiles function.
var inputElement = document.getElementById('input');
inputElement.addEventListener("change", handleFiles, false);

var numVertSeamsElement = document.getElementById('numberVerticalSeams');
numVertSeamsElement.addEventListener("change", setNumberVerticalSeams, false);

var startElement = document.getElementById('start-resizing');
startElement.addEventListener("click", startResizing.bind(this), false);
