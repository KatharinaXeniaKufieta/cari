/**********************************************
 * Custom Image Class
 *********************************************/
var Imagegraph = function(image, ctx) {
  // ImageData: Reading and writing a data
  // array to manipulate pixel data.
  console.log("image width, height: " + image.width + ", " + image.height);
  this.ctx = ctx;
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
  for (var row = 0; row < this.height; row++) {
    for (var col = 0; col < this.width; col++) {
      this.pixels.push(this.getPixel(col, row));
    }
  }
  for (var row = 0; row < this.height; row++) {
    for (var col = 0; col < this.width; col++) {
      var energy = this.calculateEnergy(col, row);
      this.pixels[this.getIndex(col, row)].setEnergy(energy);
    }
  }
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

Imagegraph.prototype.getVerticalMinPath = function() {
  // queue of pixels that need to be processed to find the
  // shortest path
  var queue = new Array(3*this.width);
  // minimum Distance that will help to find the shortest
  // path
  var minDist = Number.POSITIVE_INFINITY;
  // hold on to the last pixel that belongs to the minimum path
  var minEndPixel = -1;
  // Array of indices of the minimum path
  var minPath = new Array(this.height);

  // Add the top row of pixels to the queue
  for (var i = 0; i < this.width; i++) {
    queue.unshift(this.pixels[i]);
    this.pixels[i].marked = true;
    this.pixels[i].cost = this.pixels[i].energy;
  }
  while (queue[0] != null) {
    var currentPixel = queue.pop();
    if (currentPixel.row < this.height - 1) {
      var row = currentPixel.row + 1;
      for (var col = currentPixel.col - 1; col <= currentPixel.col + 1; col++) {
        if (col >= 0 && col < this.width) {
          var newPixel = this.pixels[getIndex(col, row)];
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
            console.log("For debugging purposes: This case should never happen");
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
  while (minEndPixel.prior != null) {
    minPath.push(minEndPixel.col);
    minEndPixel = minEndPixel.prior;
  }
  return minPath;
}


/*
 * Calculate the energy of the pixel at a specified column
 * and row.
 * PREREQUISITE: The Pixel array this.pixel has to be correctly
 * defined before calling this function.
 */
Imagegraph.prototype.calculateEnergy = function(col, row) {
  if (col === 0 || row === 0 || col === this.width - 1||
      row === this.height -1) {
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


Imagegraph.prototype.pathPicture = function(paths) {
  var pathPicture = this.ctx.createImageData(this.imageData);
  var data = pathPicture.data;


  for (var col = 0; col < this.width; col++){
    for (var row = 0; row < this.height; row++) {
      var path = this.getEnergy(col, row);
      energy = Math.floor(energy / 1000 * 255);
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
  for (var col = 0; col < this.width; col++){
    for (var row = 0; row < this.height; row++) {
      var energy = this.getEnergy(col, row);
      energy = Math.floor(energy / 1000 * 255);
      var startIndex = row * this.width * 4 + col * 4;
      data[startIndex] = energy;
      data[startIndex + 1] = energy;
      data[startIndex + 2] = energy;
      data[startIndex + 3] = 255; // alpha
    }
  }
  return energyPicture;
}
