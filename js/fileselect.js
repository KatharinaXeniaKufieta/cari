/**********************************************
 * Handle image input. Show image in canvas.
 *********************************************/
var imagegraph = {},
    energyPicture = {},
    pathPicture = {},
    energyPathPicture = {};

/**********************************************
 * Handle Image upload from user
 *********************************************/
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
