/**********************************************
 * Imagegraph class: Get data from uploaded picture,
 * create graph, run seamcarver on it
 *********************************************/
var Imagegraph = function() {
  this.context = {};
  this.imageData = {};
  this.width = {};
  this.height = {};
  this.pixelArray = [];
}

/***********************************************
 * Methods to construct Imagegraph from a canvas
 **********************************************/
Imagegraph.prototype.constructFromCanvas = function(canvas) {
  this.context = canvas.context;
  this.imageData = this.context.getImageData(0, 0, canvas.canvasWidth(), canvas.canvasHeight());
  this.width = this.imageData.width;
  this.height = this.imageData.height;
  // ImageData.data : Uint8ClampedArray represents a 1-dim array
  // containing the data in the RGBA order, with integer values
  // between 0 and 255 (included).
  this.pixelArray = [];
  // populate the pixels array with the pixels from the image that is saved in
  // the canvas
  this.setPixelArray();
};



/*
 * Create pixel object for every pixel in picture, calculate
 * its energy and save it. All pixels are saved in the array
 * this.pixelArray and contains its energy, a pointer to the pixel
 * above it and the distance traveled when searching for
 * paths.
 */
Imagegraph.prototype.setPixelArray = function() {
  for (var row = 0; row < this.height; row++) {
    for (var col = 0; col < this.width; col++) {
      this.pixelArray.push(this.getPixel(col, row));
    }
  }
  for (var row = 0; row < this.height; row++) {
    for (var col = 0; col < this.width; col++) {
      var energy = this.calculateEnergy(col, row);
      this.pixelArray[this.getIndex(col, row)].setEnergy(energy);
    }
  }
  // For debugging purposes, print the array:
  // this.printPixelArray();
};

Imagegraph.prototype.resetPixelArray = function() {
  for (var row = 0; row < this.height; row++) {
    for (var col = 0; col < this.width; col++) {
      this.pixelArray[this.getIndex(col, row)].reset();
    }
  }
};


/***********************************************
 * Methods to construct Imagegraph from another
 * Imagegraph
 **********************************************/
// copy the original pixels array into the resizedPixels array
Imagegraph.prototype.copy = function(imagegraph) {
  // this.context = {};
  this.width = imagegraph.width;
  this.height = imagegraph.height;
  // clear the pixelArray in case it was populated from before
  this.pixelArray = [];
  this.imageData = new ImageData(imagegraph.imageData.data, this.width, this.height);
  for (var i = 0, max = imagegraph.pixelArray.length; i < max; i++) {
    this.pixelArray[i] = imagegraph.pixelArray[i];
  }
};

/******************
 * General Methods
 *****************/
/*
 * Calculate the energy of the pixel at a specified column
 * and row.
 */
Imagegraph.prototype.calculateEnergy = function(col, row) {
  if (this.pixelArray.length > 0) {
    if (col === 0 || row === 0 || col === this.width - 1 ||
        row === this.height - 1) {
      return 1000;
    }
    var pixelAbove = this.pixelArray[this.getIndex(col, row - 1)],
        pixelBelow = this.pixelArray[this.getIndex(col, row + 1)],
        pixelLeft = this.pixelArray[this.getIndex(col - 1, row)],
        pixelRight = this.pixelArray[this.getIndex(col + 1, row)];

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
  } else {
    throw new EmptyPixelArrayException();
  }
};


/*
 * Return the index for the given row and column.
 */
Imagegraph.prototype.getIndex = function(col, row) {
  return row * this.width + col;
};

/*
 * Return the energy of the pixel at the given row and column.
 */
Imagegraph.prototype.getEnergy = function(col, row) {
  if (this.pixelArray.length > 0) {
    return this.pixelArray[this.getIndex(col, row)].energy;
  } else {
    throw new EmptyPixelArrayException();
  }
}


/*
 * Create the energy picture by calculating the energy of each
 * each pixel from the original picture. It skips over the
 * creation of the pixel array which makes it faster.
 */
Imagegraph.prototype.energyPicture = function() {
  var energyPicture = new ImageData(this.imageData.data, this.width, this.height);
  var data = energyPicture.data;
  var maxVal = 0;
  var stringEnergy = "";
  // console.log("-------------------- Energy of the picture : --------------------");
  for (var row = 0; row < this.height; row++) {
    for (var col = 0; col < this.width; col++) {
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
    // console.log(stringEnergy);
    // stringEnergy = "";
  }
  // console.log("-----------------------------------------------------------------");
  // if the picture is black, return it
  if (maxVal === 0) {
    return energyPicture;
  }
  console.log("maxVal: " + maxVal);
  // normalize picture
  for (var row = 1; row < this.height - 1; row++) {
    for (var col = 1; col < this.width - 1; col++) {
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

Imagegraph.prototype.picture = function() {
  var picture = new ImageData(this.imageData.data, this.width, this.height);
  return picture;
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
};

// For debugging purposes: Print pixels of the image (RGB values)
Imagegraph.prototype.printPixelArray = function() {
  if (this.pixelArray === undefined) {
    console.log('pixelArray is undefined ,can not print its values');
  } else {
    var stringPixels = "";
    console.log("-------------------- Energy of the picture : ---------------");
    for (var row = 0; row < this.height; row++) {
      for (var col = 0; col < this.width; col++) {
        if (col == this.width - 1) {
          stringPixels += this.getPixel(col, row).toString();
        } else {
          stringPixels += this.getPixel(col, row).toString() + ", ";
        }
      }
      console.log(stringPixels);
      stringPixels = "";
    }
    console.log("------------------------------------------------------------");
  }
};

// Exceptions
function EmptyPixelArrayException() {
  this.message = "PixelArray is empty";
};

function EmptyObjectException() {
  this.message = "Object is empty";
};
