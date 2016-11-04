/**********************************************
 * Imagegraph class: Get data from uploaded picture,
 * create graph, run seamcarver on it
 *********************************************/
var Imagegraph = function(image, context) {
  // ImageData: Reading and writing a data
  // array to manipulate pixel data.
  console.log("image width, height: " + image.width + ", " + image.height);
  this.ctx = context;
  this.imageData = this.ctx.getImageData(0, 0, image.width, image.height);
  this.width = this.imageData.width;
  this.height = this.imageData.height;
  // ImageData.data : Uint8ClampedArray represents a 1-dim array
  // containing the data in the RGBA order, with integer values
  // between 0 and 255 (included).
  this.pixels = [];
  this.setPixelArray();
}

/*
 * Create pixel object for every pixel in picture, calculate
 * its energy and save it. All pixels are saved in the array
 * this.pixels and contains its energy, a pointer to the pixel
 * above it and the distance so far traveled when searching for
 * paths.
 */
Imagegraph.prototype.setPixelArray = function() {
  var stringPixels = "";
  console.log("-------------------- Energy of the picture : --------------------");
  for (var row = 0; row < this.height; row++) {
    for (var col = 0; col < this.width; col++) {
      this.pixels.push(this.getPixel(col, row));
      if (col == this.width - 1) {
        stringPixels += this.getPixel(col, row).toString();
      } else {
        stringPixels += this.getPixel(col, row).toString() + ", ";
      }
    }
    console.log(stringPixels);
    stringPixels = "";
  }
  for (var row = 0; row < this.height; row++) {
    for (var col = 0; col < this.width; col++) {
      var energy = this.calculateEnergy(col, row);
      this.pixels[this.getIndex(col, row)].setEnergy(energy);
    }
  }
  console.log("-----------------------------------------------------------------");
}

/*
 * Return the pixel at the specified column and row.
*/
Imagegraph.prototype.getPixel = function(col, row) {
  var startIndex = row * this.width * 4 + col * 4;
  var red = this.imageData.data[startIndex],
      green = this.imageData.data[startIndex + 1],
      blue = this.imageData.data[startIndex + 2],
      alpha = this.imageData.data[startIndex + 3];
  return new Pixel(col, row, new Color(red, green, blue, alpha));
}


/*
 * Find vertical seam
 */
Imagegraph.prototype.getVerticalMinPath = function() {
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
  for (var i = 0; i < this.width; i++) {
    queue.unshift(this.pixels[i]);
    this.pixels[i].marked = true;
    this.pixels[i].cost = this.pixels[i].energy;
  }
  while (queue[0] != null) {
    currentPixel = queue.pop();
    if (currentPixel.row < this.height - 1) {
      var row = currentPixel.row + 1;
      for (var col = currentPixel.col - 1; col <= currentPixel.col + 1; col++) {
        if (col >= 0 && col < this.width) {
          newPixel = this.pixels[this.getIndex(col, row)];
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
  console.log("MinEndPixel is found and has cost " + minEndPixel.cost);
  var counter = 0;
  while (minEndPixel != null) {
    counter++;
    minPath.unshift(minEndPixel.col);
    minEndPixel = minEndPixel.prior;
  }
  this.printPath(minPath);
  return minPath;
}

// Print the path in the console
Imagegraph.prototype.printPath = function(minPath) {
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


/*
 * Calculate the energy of the pixel at a specified column
 * and row.
 * PREREQUISITE: The Pixel array this.pixel has to be correctly
 * defined before calling this function.
 */
Imagegraph.prototype.calculateEnergy = function(col, row) {
  if (col === 0 || row === 0 || col === this.width - 1 ||
      row === this.height - 1) {
    return 1000;
  }
  var pixelAbove = this.pixels[this.getIndex(col, row - 1)],
      pixelBelow = this.pixels[this.getIndex(col, row + 1)],
      pixelLeft = this.pixels[this.getIndex(col - 1, row)],
      pixelRight = this.pixels[this.getIndex(col + 1, row)];

  var redX = pixelRight.color.red - pixelLeft.color.red,
      greenX = pixelRight.color.green - pixelLeft.color.green,
      blueX = pixelRight.color.blue - pixelLeft.color.blue;
  var redY = pixelBelow.color.red - pixelAbove.color.red,
      greenY = pixelBelow.color.green - pixelAbove.color.green,
      blueY = pixelBelow.color.blue - pixelAbove.color.blue;
  var xGradientSquared = redX * redX + greenX * greenX + blueX * blueX,
      yGradientSquared = redY * redY + greenY * greenY + blueY * blueY;
  var energy = Math.sqrt(xGradientSquared + yGradientSquared);

  return energy;
}


/*
 * Create picture where the seams are highlighted in red
 */
Imagegraph.prototype.pathPicture = function() {
  var pathPicture = this.ctx.createImageData(this.imageData);
  var data = pathPicture.data;
  for (var col = 0; col < this.width; col++){
    for (var row = 0; row < this.height; row++) {
      var energy = this.getEnergy(col, row);
      energy = Math.floor(energy / 1000 * 255);
      var startIndex = row * this.width * 4 + col * 4;
      data[startIndex] = this.imageData.data[startIndex];
      data[startIndex + 1] = this.imageData.data[startIndex + 1];
      data[startIndex + 2] = this.imageData.data[startIndex + 2];
      data[startIndex + 3] = this.imageData.data[startIndex + 3]; // alpha
    }
  }
  return pathPicture;
}

/*
 * Add paths in red to pathPicture
 */
Imagegraph.prototype.addPaths = function(pathPicture, path) {
  console.log("path: " + path);
  var data = pathPicture.data;
  // add path to picture
  for (var row = 0; row < this.height; row++) {
    var col = path[row];
    var startIndex = row * this.width * 4 + col * 4;
    data[startIndex] = 255;
    data[startIndex + 1] = 0;
    data[startIndex + 2] = 0;
    data[startIndex + 3] = 255; // alpha
  }
  // add path to data, make it red and return picture
  return pathPicture;
}

/*
 * Remove the path from the minimized picture
 */
Imagegraph.prototype.removePath = function(path) {
  // just remove it.
}

/*
 * Return the index for the given row and column.
 */
Imagegraph.prototype.getIndex = function(col, row) {
  return row * this.width + col;
}

/*
 * Return the energy of the pixel at the given row and column.
 */
Imagegraph.prototype.getEnergy = function(col, row) {
  return this.pixels[this.getIndex(col, row)].energy;
}

/*
 * Create the energy picture by calculating the energy of each
 * each pixel from the original picture. It skips over the
 * creation of the pixel array which makes it faster.
 */
Imagegraph.prototype.energyPicture = function() {
  var energyPicture = this.ctx.createImageData(this.imageData);
  var data = energyPicture.data;
  var maxVal = 0;
  var stringEnergy = "";
  console.log("-------------------- Energy of the picture : --------------------");
  for (var row = 0; row < this.height; row++) {
    for (var col = 0; col < this.width; col++){
      var energy = this.getEnergy(col, row);
      if (col == this.width - 1) {
        stringEnergy += energy.toFixed(2);
      } else {
        stringEnergy += energy.toFixed(2) + ", ";
      }
      if (row !== 0 && col !== 0 && row !== this.height - 1 && col !== this.width - 1) {
        if (energy > maxVal) {
          maxVal = energy;
        }
      }
      energy = Math.floor(energy / 1000 * 255);
      var startIndex = row * this.width * 4 + col * 4;
      data[startIndex] = energy;
      data[startIndex + 1] = energy;
      data[startIndex + 2] = energy;
      data[startIndex + 3] = 255; // alpha
    }
    console.log(stringEnergy);
    stringEnergy = "";
  }
  console.log("-----------------------------------------------------------------");
  // if the picture is black, return it
  if (maxVal === 0) {
    return energyPicture;
  }
  console.log("maxVal: " + maxVal);
  // normalize picture
  for (var row = 1; row < this.height - 1; row++) {
    for (var col = 1; col < this.width - 1; col++){
      var energy = this.getEnergy(col, row);
      energy = Math.floor(energy / maxVal * 255);
      var startIndex = row * this.width * 4 + col * 4;
      data[startIndex] = energy;
      data[startIndex + 1] = energy;
      data[startIndex + 2] = energy;
      data[startIndex + 3] = 255; // alpha
    }
  }
  return energyPicture;
}

/*
 * Create picture where the seams are highlighted in red
 */
Imagegraph.prototype.pathEnergyPicture = function() {
  var pathEnergyPicture = this.energyPicture();
  var data = pathEnergyPicture.data;
  for (var col = 0; col < this.width; col++){
    for (var row = 0; row < this.height; row++) {
      var energy = this.getEnergy(col, row);
      energy = Math.floor(energy / 1000 * 255);
      var startIndex = row * this.width * 4 + col * 4;
      data[startIndex] = this.imageData.data[startIndex];
      data[startIndex + 1] = this.imageData.data[startIndex + 1];
      data[startIndex + 2] = this.imageData.data[startIndex + 2];
      data[startIndex + 3] = this.imageData.data[startIndex + 3]; // alpha
    }
  }
  return pathEnergyPicture;
}
