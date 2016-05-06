var Color = function(r, g, b, a) {
  this.red = r;
  this.green = g;
  this.blue = b;
  this.alpha = a;
}

Color.prototype.toString = function() {
  var stringColor = "rgba = (" + this.red + ", " + this.green + ", " +
      this.blue + ", " + this.alpha + ")";
  return stringColor;
}

/**********************************************
* Custom Pixel Class
*********************************************/
var Pixel = function(col, row, color) {
  this.col = col;
  this.row = row;
  this.color = color;
  this.marked = false;

  this.energy = null;
  this.cost = null;
  this.prior = null; // edge to pixel before this pixel on the search path
}

// set the energy of the pixel
Pixel.prototype.setEnergy = function(energy) {
  this.energy = energy;
}

// set the cost from starting Pixel
Pixel.prototype.setCost = function(dist) {
  this.cost = cost;
}

// Set Edge to Pixel pixel (for backtracing a path)
Pixel.prototype.setEdgeTo = function(pixel) {
  this.prior = pixel;
}

// Describe pixel in a string
Pixel.prototype.toString = function() {
  var stringPixel = "(col, row) = (" + this.col + ", " + this.row +
      "), " + this.color.toString();
  return stringPixel;
}
