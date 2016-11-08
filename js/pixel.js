/**********************************************
 * Custom Color Class
 *********************************************/
var Color = function(r, g, b, a) {
  this.red = r;
  this.green = g;
  this.blue = b;
  this.alpha = a;
}

/*
 * Write the color to a string
 */
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

/*
 * Set the energy of the pixel
 */
Pixel.prototype.setEnergy = function(energy) {
  this.energy = energy;
}

/*
 * Set the cost from starting Pixel
 */
Pixel.prototype.setCost = function(cost) {
  this.cost = cost;
}

/*
 * Set Edge to Pixel pixel (for backtracing a path)
 */
Pixel.prototype.setEdgeTo = function(pixel) {
  this.prior = pixel;
}

/*
 * Write the pixel to a string
 */
Pixel.prototype.toString = function() {
  var stringPixel = "(col, row) = (" + this.col + ", " + this.row +
      "), " + this.color.toString();
  return stringPixel;
}

Pixel.prototype.reset = function(col, row) {
  this.marked = false;
  this.cost = null;
  this.prior = null;
  this.col = col;
  this.row = row;
}

Pixel.prototype.copy = function(pixel) {
  this.col = pixel.col;
  this.row = pixel.row;
  this.color = pixel.color;
  this.marked = pixel.marked;

  this.energy = pixel.energy;
  this.cost = pixel.cost;
  this.prior = pixel.prior; // edge to pixel before this pixel on the search path
}
