/* There are two ways one can implement seam carving in the browser:
   1. Precalculate seams in vertical, horizontal and diagonal direction. Allow
   the user to resize in only those directions. Would work very fast,
   but it would restrict the user to go either vertically, horizontally or
   diagonally. If the user would then decide to change direction of
   resizing, this algorithm would have to precalculate all options once more.
   2. The naive solution: Keep the original image, and whatever the user decides
   he/she wants to resize: Run seam carving from the original image
   to achieve that resized image.
   One way to optimize this would be to precalculate e.g. 25%, 50% and 75%
   sizes of the images, and go from these images depending on where the user
   starts from.
*/

/**********************************************
 * Seamcarver class: Take data from uploaded picture,
 * create Imagegraph, run seamcarving on it
 *********************************************/
/**
 * The Seamcarver takes care of creating Imagegraphs, finding seams in the
 * image, deleting seams and displaying the various images on the canvas.
 * @constructor
 * @param {object} canvas - The canvas where the image was uploaded and
 * displayed from the user.
 */
var Seamcarver = function(canvas) {
  // Create imagegraph from the image in the canvas
  this.originalImage = new Imagegraph();
  this.originalImage.constructFromCanvas(canvas);
  // Will be copied from originalImage every time resizeWidth is called
  this.resizedImage = new Imagegraph();
}

Seamcarver.prototype.prepareResize = function() {
  // prepare images before calculating seams
  this.originalImage.resetSeams();
  this.resizedImage = new Imagegraph();
  this.resizedImage.copy(this.originalImage);
}

/**
 * Resizes the width of the uploaded image.
 * @param {number} numberVerticalSeams - Number of vertical seams to be deleted,
 * as defined by the user.
 * @param {number} numberHorizontalSeams - Number of horizontal seams to be
 * deleted, as defined by the user.
 */
Seamcarver.prototype.resizeWidth = function(numberVerticalSeams, numberHorizontalSeams, maxProgress, progress, timeLeft, seam) {
  if (seam === 0) {
    // reset the seams in the original image before restarting a new calculation.
    if (numberVerticalSeams >= this.resizedImage.width) {
      console.log('can not delete more seams than the width of the image');
      numberVerticalSeams = this.resizedImage.width - 1;
    }
    if (numberHorizontalSeams >= this.resizedImage.height) {
      console.log('can not delete more seams than the height of the image');
      numberHorizontalSeams = this.resizedImage.height - 1;
    }

    maxProgress(parseInt(numberVerticalSeams) + parseInt(numberHorizontalSeams));
    var startTime = Date.now();
  }

  // Delete diagonally first
  var diagonal = Math.min(numberVerticalSeams, numberHorizontalSeams);
  // console.log(diagonal);
  // var seam = 0;
  var currentProgress = 0;
  if (seam < diagonal) {
    this.calculateHorizontalSeam(seam);
    currentProgress = progress() + 1;
    progress(currentProgress);
    this.calculateVerticalSeam(seam);
    currentProgress = progress() + 1;
    progress(currentProgress);
    timeLeft((Date.now() - startTime)/(seam * 2) * maxProgress());
    seam++;
    return seam;
  }
  var totalSeamDiag = seam;

  // Delete the rest: delete vertical if there are more vertical seams to be
  // deleted
  if (seam >= diagonal && seam < numberVerticalSeams) {
    this.calculateVerticalSeam(seam);
    currentProgress = progress() + 1;
    progress(currentProgress);
    timeLeft((Date.now() - startTime)/(totalSeamDiag + seam) * maxProgress());
    seam++;
    return seam;
  }

  // Delete the rest: delete horizontal if there are more horizontal seams to be
  // deleted
  if (seam >= diagonal && seam < numberHorizontalSeams) {
    this.calculateHorizontalSeam(seam);
    currentProgress = progress() + 1;
    progress(currentProgress);
    timeLeft((Date.now() - startTime)/(totalSeamDiag + seam) * maxProgress());
    seam++;
    return seam;
  }
}

/**
 * Calculates and returns the vertical seam.
 * @returns {array of numbers} Seam with the smallest energy.
 */
Seamcarver.prototype.getVerticalMinPath = function() {
  var newPixel = {};
  // queue of pixels that need to be processed to find the
  // shortest path
  var queue = new Array();
  var currentPixel = {};
  // minimum Distance that will help to find the shortest
  // path
  var minDist = Number.POSITIVE_INFINITY;
  // hold on to the last pixel that belongs to the minimum path
  var minEndPixel = -1;
  // Array of indices of the minimum path
  minPath = new Array();

  // Add the top row of pixels to the queue
  for (var col = 0; col < this.resizedImage.width; col++) {
    queue.unshift(this.resizedImage.pixelArray[col]);
    this.resizedImage.pixelArray[col].marked = true;
    this.resizedImage.pixelArray[col].cost = this.resizedImage.pixelArray[col].energy;
  }
  while (queue[0] != null) {
    currentPixel = queue.pop();
    if (currentPixel.row < this.resizedImage.height - 1) {
      var row = currentPixel.row + 1;
      for (var col = currentPixel.col - 1; col <= currentPixel.col + 1; col++) {
        if (col >= 0 && col < this.resizedImage.width) {
          newPixel = this.resizedImage.pixelArray[this.resizedImage.getIndex(col, row)];
          if (!newPixel.marked) {
            newPixel.cost = currentPixel.cost + newPixel.energy;
            newPixel.prior = currentPixel;
            newPixel.marked = true;
            queue.unshift(newPixel);
          } else if (newPixel.cost > currentPixel.cost + newPixel.energy) {
            var index = queue.indexOf(newPixel);
            newPixel.cost = currentPixel.cost + newPixel.energy;
            newPixel.prior = currentPixel;
            queue[index] = newPixel;
          } else {
            // "Pixel is already in queue and the new cost is not lower");
          }
        }
      }
    } else {
      if (currentPixel.cost < minDist) {
        minDist = currentPixel.cost;
        minEndPixel = currentPixel;
      }
    }
  }
  // console.log("MinEndPixel is found and has cost " + minEndPixel.cost);
  var counter = 0;
  while (minEndPixel != null) {
    counter++;
    minPath.unshift(minEndPixel.col);
    minEndPixel = minEndPixel.prior;
  }
  // this.printPath(minPath);
  if (minPath.length != this.resizedImage.height) {
    throw new NoPathFoundException();
  }
  return minPath;
};

/**
 * Calculates and returns the horizontal seam.
 * @returns {array of numbers} Seam with the smallest energy.
 */
Seamcarver.prototype.getHorizontalMinPath = function() {
  var newPixel = {};
  // queue of pixels that need to be processed to find the
  // shortest path
  var queue = new Array();
  var currentPixel = {};
  // minimum Distance that will help to find the shortest
  // path
  var minDist = Number.POSITIVE_INFINITY;
  // hold on to the last pixel that belongs to the minimum path
  var minEndPixel = -1;
  // Array of indices of the minimum path
  minPath = new Array();

  // Add the left column of pixels to the queue
  for (var row = 0; row < this.resizedImage.height; row++) {
    var col = 0;
    var index = this.resizedImage.getIndex(col, row);
    queue.unshift(this.resizedImage.pixelArray[index]);
    this.resizedImage.pixelArray[index].marked = true;
    this.resizedImage.pixelArray[index].cost = this.resizedImage.pixelArray[index].energy;
  }
  while (queue[0] != null) {
    currentPixel = queue.pop();
    if (currentPixel.col < this.resizedImage.width - 1) {
      var col = currentPixel.col + 1;
      for (var row = currentPixel.row - 1; row <= currentPixel.row + 1; row++) {
        if (row >= 0 && row < this.resizedImage.height) {
          newPixel = this.resizedImage.pixelArray[this.resizedImage.getIndex(col, row)];
          if (!newPixel.marked) {
            newPixel.cost = currentPixel.cost + newPixel.energy;
            newPixel.prior = currentPixel;
            newPixel.marked = true;
            queue.unshift(newPixel);
          } else if (newPixel.cost > currentPixel.cost + newPixel.energy) {
            var index = queue.indexOf(newPixel);
            newPixel.cost = currentPixel.cost + newPixel.energy;
            newPixel.prior = currentPixel;
            queue[index] = newPixel;
          } else {
            // "Pixel is already in queue and the new cost is not lower");
          }
        }
      }
    } else {
      if (currentPixel.cost < minDist) {
        minDist = currentPixel.cost;
        minEndPixel = currentPixel;
      }
    }
  }
  // console.log("MinEndPixel is found and has cost " + minEndPixel.cost);
  var counter = 0;
  while (minEndPixel != null) {
    counter++;
    minPath.unshift(minEndPixel.row);
    minEndPixel = minEndPixel.prior;
  }
  // this.printPath(minPath);
  if (minPath.length != this.resizedImage.width) {
    throw new NoPathFoundException();
  }
  return minPath;
};

/**
 * Save the vertical seam to the original image for display.
 * @param {array of numbers} path - Vertical seam that will be deleted.
 */
Seamcarver.prototype.saveVerticalSeam = function(path, seamNumber) {
  var col, resizedIndex, originalIndex, originalRow, originalCol;
  for (var row = 0; row < path.length; row++) {
    col = path[row];
    resizedIndex = this.resizedImage.getIndex(col, row);
    originalCol = this.resizedImage.pixelArray[resizedIndex].originalCol;
    originalRow = this.resizedImage.pixelArray[resizedIndex].originalRow;
    originalIndex = this.originalImage.getIndex(originalCol, originalRow);
    this.originalImage.pixelArray[originalIndex].deletedBySeamNumber = seamNumber;
  }
};

/**
 * Save the horizontal seam to the original image for display.
 * @param {array of numbers} path - Horizontal seam that will be deleted.
 */
Seamcarver.prototype.saveHorizontalSeam = function(path, seamNumber) {
  var row, resizedIndex, originalIndex, originalRow, originalCol;
  for (var col = 0; col < path.length; col++) {
    row = path[col];
    resizedIndex = this.resizedImage.getIndex(col, row);
    originalCol = this.resizedImage.pixelArray[resizedIndex].originalCol;
    originalRow = this.resizedImage.pixelArray[resizedIndex].originalRow;
    originalIndex = this.originalImage.getIndex(originalCol, originalRow);
    this.originalImage.pixelArray[originalIndex].deletedBySeamNumber = seamNumber;
  }
};

/**
 * Remove the vertical path from the image.
 * @param {array of numbers} path - Seam that will be deleted.
 */
Seamcarver.prototype.removeVerticalPath = function(path) {
  var width = this.resizedImage.width;
  var height = this.resizedImage.height;
  if (path === undefined) {
    console.log('no path');
  }
  var data = this.resizedImage.imageData.data;
  var adjustIndex = 0;
  var index, startIndex, adjustedIndex, adjustedRow, adjustedCol;
  for (var row = 0; row < height; row++) {
    for (var col = 0; col < width; col++) {
      index = this.resizedImage.getIndex(col, row);
      adjustedIndex = index + adjustIndex;
      adjustedRow = Math.floor(adjustedIndex / width);
      adjustedCol = adjustedIndex % width;
      if (path[adjustedRow] === adjustedCol) {
        adjustIndex++;
      }
      this.resizedImage.pixelArray[index] = this.resizedImage.pixelArray[index + adjustIndex];

      // var data = this.resizedImage.imageData.data;
      startIndex = row * width * 4 + col * 4;
      data[startIndex] = data[startIndex + adjustIndex * 4];
      data[startIndex + 1] = data[startIndex + 1 + adjustIndex * 4];
      data[startIndex + 2] = data[startIndex + 2 + adjustIndex * 4];
      data[startIndex + 3] = 255; // alpha
    }
  }
  for (var i = 0; i < path.length; i++) {
    this.resizedImage.pixelArray.pop();
  }
  this.resizedImage.width--;
  var dataCopy = new Uint8ClampedArray(data.slice(0, -adjustIndex * 4));
  this.resizedImage.imageData = new ImageData(dataCopy, this.resizedImage.width, this.resizedImage.height);
};

/**
 * Remove the horizontal path from the image.
 * @param {array of numbers} path - Seam that will be deleted.
 */
Seamcarver.prototype.removeHorizontalPath = function(path) {
  var width = this.resizedImage.width;
  var height = this.resizedImage.height;
  if (path === undefined) {
    console.log('no path');
  }
  var data = this.resizedImage.imageData.data;
  var tempData = new Uint8ClampedArray(data);
  var tempPixelArray = this.resizedImage.copyPixelArray();
  // Transpose the pixelArray and the data, and save them in temporary
  // variables tempData and tempPixelArray.
  var index, startIndex, counter = 0, dataCounter = 0;
  for (var col = 0; col < width; col++) {
    for (var row = 0; row < height; row++) {
      index = this.resizedImage.getIndex(col, row);
      tempPixelArray[counter] = this.resizedImage.pixelArray[index];
      dataCounter = counter * 4;
      startIndex = row * width * 4 + col * 4;
      tempData[dataCounter] = data[startIndex];
      tempData[dataCounter + 1] = data[startIndex + 1];
      tempData[dataCounter + 2] = data[startIndex + 2];
      tempData[dataCounter + 3] = 255; // alpha
      counter++;
    }
  }
  // delete the seams from the transposed arrays
  counter = 0;
  var adjustIndex = 0;
  var adjustedIndex, adjustedRow, adjustedCol;
  for (var i = 0; i < height; i++) {
    for (var j = 0; j < width; j++) {
      adjustedIndex = counter + adjustIndex;
      adjustedRow = Math.floor(adjustedIndex / height);
      adjustedCol = adjustedIndex % height;
      // Columns and rows are flipped now, because we transposed the array.
      if (path[adjustedRow] === adjustedCol) {
        adjustIndex++;
      }
      tempPixelArray[counter] = tempPixelArray[counter + adjustIndex];
      startIndex = counter * 4;
      tempData[startIndex] = tempData[startIndex + adjustIndex * 4];
      tempData[startIndex + 1] = tempData[startIndex + 1 + adjustIndex * 4];
      tempData[startIndex + 2] = tempData[startIndex + 2 + adjustIndex * 4];
      tempData[startIndex + 3] = 255; // alpha
      counter++;
    }
  }
  // resize both original and temporary pixelArrays and image data
  for (var i = 0; i < path.length; i++) {
    tempPixelArray.pop();
    this.resizedImage.pixelArray.pop();
  }
  this.resizedImage.height--;
  var dataCopy = new Uint8ClampedArray(tempData.slice(0, -adjustIndex * 4));
  // Transpose the pixelArray and the data back.
  counter = 0;
  dataCounter = 0;
  height = this.resizedImage.height;
  for (var col = 0; col < width; col++) {
    for (var row = 0; row < height; row++) {
      index = this.resizedImage.getIndex(col, row);
      this.resizedImage.pixelArray[index] = tempPixelArray[counter];
      dataCounter = counter * 4;
      startIndex = row * width * 4 + col * 4;
      dataCopy[startIndex] = tempData[dataCounter];
      dataCopy[startIndex + 1] = tempData[dataCounter + 1];
      dataCopy[startIndex + 2] = tempData[dataCounter + 2];
      dataCopy[startIndex + 3] = 255; // alpha
      counter++;
    }
  }
  // make sure you're definitely making copies by value
  var redundantDataCopy = new Uint8ClampedArray(dataCopy);
  this.resizedImage.imageData = new ImageData(redundantDataCopy, this.resizedImage.width, this.resizedImage.height);
};

/**
 * Recalculates the energy around the vertical seam that was deleted.
 * @param {array of numbers} path - The seam that was deleted.
 */
Seamcarver.prototype.recalculateVerticalEnergy = function(path) {
  var col;
  for (var row = 0; row < this.resizedImage.height; row++) {
    col = path[row];
    // adjust the column to be within the bounds of the new, resized image.
    // This could be the case, because the image was resized and the path could
    // now be out of bounds.
    if (col >= this.resizedImage.width) {
      col = this.resizedImage.width - 1;
    }
    if (col > 0) {
      this.resizedImage.calculateEnergy(col - 1, row);
    }
    if (col < this.resizedImage.width - 1) {
      this.resizedImage.calculateEnergy(col + 1, row);
    }
    this.resizedImage.calculateEnergy(col, row);
  }
};

/**
 * Recalculates the energy around the horizontal seam that was deleted.
 * @param {array of numbers} path - The seam that was deleted.
 */
Seamcarver.prototype.recalculateHorizontalEnergy = function(path) {
  var row;
  for (var col = 0; col < this.resizedImage.width; col++) {
    row = path[col];
    // adjust the column to be within the bounds of the new, resized image.
    // This could be the case, because the image was resized and the path could
    // now be out of bounds.
    if (row >= this.resizedImage.height) {
      row = this.resizedImage.height - 1;
    }
    if (row > 0) {
      this.resizedImage.calculateEnergy(col, row - 1);
    }
    if (row < this.resizedImage.height - 1) {
      this.resizedImage.calculateEnergy(col, row + 1);
    }
    this.resizedImage.calculateEnergy(col, row);
  }
};

/**
 * Take a picture and add the seams to it, highlighted in red.
 * @param {object} imagedata - Imagedata of the image.
 * @param {number} width - Width of the image.
 * @param {number} height - Height of the image.
 * @returns {object} Imagedata of the image including the seams.
 */
Seamcarver.prototype.addSeamsToPicture = function(imagedata, width, height) {
  var dataCopy = new Uint8ClampedArray(imagedata.data);
  var pathPicture = new ImageData(dataCopy, width, height);
  var data = pathPicture.data;
  var index;
  if (width != this.originalImage.width || height != this.originalImage.height) {
    throw new DimensionsNotEqualException();
  }
  // add seams to picture, in red color
  for (var row = 0; row < height; row++) {
    for (var col = 0; col < width; col++) {
      // add each path to data, make it red
      index = this.originalImage.getIndex(col, row);
      if (this.originalImage.pixelArray[index].deletedBySeamNumber != -1) {
        var startIndex = row * width * 4 + col * 4;
        data[startIndex] = 255;
        data[startIndex + 1] = 0;
        data[startIndex + 2] = 0;
        data[startIndex + 3] = 255; // alpha
      }
    }
  }
  return pathPicture;
};


/**
 * Returns the original picture with all seams displayed in red.
 * @returns {object} Imagedata of the original image with red seams.
 */
Seamcarver.prototype.pathPicture = function() {
  return this.addSeamsToPicture(this.originalImage.imageData, this.originalImage.width, this.originalImage.height);
};

/**
 * Returns the original energy picture with all seams displayed in red.
 * @returns {object} Imagedata of the original energy picture with red seams.
 */
Seamcarver.prototype.energyPathPicture = function() {
  var energyPicture = this.originalImage.energyPicture();
  return this.addSeamsToPicture(energyPicture, this.originalImage.width, this.originalImage.height);
};

/**
 * Returns the resized picture.
 * @returns {object} Imagedata of the resized picture.
 */
Seamcarver.prototype.resizedPicture = function() {
  return this.resizedImage.picture();
};

/**
 * Returns the resized energy picture.
 * @returns {object} Imagedata of the resized energy picture.
 */
Seamcarver.prototype.resizedEnergyPicture = function() {
  return this.resizedImage.energyPicture();
};

/**
 * Calculate the next vertical seam.
 * @param {numbers} seamNumber - Number of the seam that is currently calculated.
 * @returns {array of numbers} Vertical seam.
 */
Seamcarver.prototype.calculateVerticalSeam = function(seamNumber) {
  var verticalMinPath = this.getVerticalMinPath();
  this.saveVerticalSeam(verticalMinPath, seamNumber);
  this.removeVerticalPath(verticalMinPath);
  this.recalculateVerticalEnergy(verticalMinPath);
  this.resizedImage.resetPixelArray();
  return verticalMinPath;
};

/**
 * Calculate the next horizontal seam.
 * @param {numbers} seamNumber - Number of the seam that is currently calculated.
 * @returns {array of numbers} Horizontal seam.
 */
Seamcarver.prototype.calculateHorizontalSeam = function(seamNumber) {
  var horizontalMinPath = this.getHorizontalMinPath();
  this.saveHorizontalSeam(horizontalMinPath, seamNumber);
  this.removeHorizontalPath(horizontalMinPath);
  this.recalculateHorizontalEnergy(horizontalMinPath);
  this.resizedImage.resetPixelArray();
  return horizontalMinPath;
};

/**
 * Print the path in the console.
 * @param {array of numbers} minPath - Calculated seam.
 */
Seamcarver.prototype.printPath = function(minPath) {
  console.log("-------------------- Vertical seam : --------------------");
  var stringPath = "Vertical seam : { ";
  for (var i = 0; i < minPath.length; i++) {
    stringPath += minPath[i] + " ";
  }
  stringPath += "}";
  console.log(stringPath);
  stringPath = "";
  for (var row = 0; row < this.height; row++) {
    for (var col = 0; col < this.width; col++) {
      if (col === minPath[row]) {
        stringPath += this.getEnergy(col, row).toFixed(2) + "* ";
      } else {
        stringPath += this.getEnergy(col, row).toFixed(2) + "  ";
      }
    }
    console.log(stringPath);
    stringPath = "";
  }
  console.log("---------------------------------------------------------");
}

/**************
 * Exceptions *
 **************/
function NoPathFoundException() {
  this.message = "No path was found";
};

function DimensionsNotEqualException() {
  this.message = "Dimensions of image for seams display must be equal";
};
