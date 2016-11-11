/**********************************************
 * Custom Color Class
 *********************************************/
/**
 * Creates a Color from RGBA values.
 * @constructor
 * @param {number} r - The red value.
 * @param {number} g - The green value.
 * @param {number} b - The blue value.
 * @param {number} a - The alpha value, opacity.
 */
var Color = function(r, g, b, a) {
  this.red = r;
  this.green = g;
  this.blue = b;
  this.alpha = a;
}

/**
 * Returns a string describing the Color.
 * @returns {string} String describing the Color.
 */
Color.prototype.toString = function() {
  var stringColor = "rgba = (" + this.red + ", " + this.green + ", " +
      this.blue + ", " + this.alpha + ")";
  return stringColor;
}

/**********************************************
* Custom Pixel Class
*********************************************/
/**
 * Creates a Pixel.
 * @constructor
 * @param {number} col - The column where the pixel is located.
 * @param {number} row - The row where the pixel is located.
 * @param {object} color - The color of the pixel.
 */
var Pixel = function(col, row, color) {
  this.col = col;
  this.row = row;
  this.color = color;
  this.marked = false;

  this.energy = null;
  this.cost = null;
  this.prior = null; // edge to pixel before this pixel on the search path
}

/**
 * Set the energy of a Pixel.
 * @param {number} energy - Energy of a pixel.
 */
Pixel.prototype.setEnergy = function(energy) {
  this.energy = energy;
}

/**
 * Set the cost of a Pixel.
 * @param {number} cost - Cost of a pixel, used in the calculation of the seams.
 */
Pixel.prototype.setCost = function(cost) {
  this.cost = cost;
}

/**
 * Set the edge to a Pixel, for backtracing a seam.
 * @param {object} pixel - Pixel that this pixel is pointing to, to remember the
 * calculated seam.
 */
Pixel.prototype.setEdgeTo = function(pixel) {
  this.prior = pixel;
}

/**
 * Writes a Pixel to a string.
 * @returns {string} String describing the Pixel.
 */
Pixel.prototype.toString = function() {
  var string = "(col, row) = (" + this.col + ", " + this.row +
      "), " + this.color.toString();
  return string;
}

/**
 * Reset the Pixel values. This needs to be done before each seam calculation.
 * @param {number} col - The column of the new location of the Pixel.
 * @param {number} row - The row of the new location of the Pixel.
 */
Pixel.prototype.reset = function(col, row) {
  this.marked = false;
  this.cost = null;
  this.prior = null;
  this.col = col;
  this.row = row;
}

/**
 * Make a copy of another Pixel.
 * @param {object} pixel - Pixel that we're copying from.
 */
Pixel.prototype.copy = function(pixel) {
  this.col = pixel.col;
  this.row = pixel.row;
  this.color = pixel.color;
  this.marked = pixel.marked;

  this.energy = pixel.energy;
  this.cost = pixel.cost;
  this.prior = pixel.prior; // edge to pixel before this pixel on the search path
}
