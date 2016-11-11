/**
 * Checks if an object is empty.
 * @param {object} obj - Object that is checked if it's empty or not.
 * @returns {boolean} True if object is empty, otherwise false.
 */
function isEmpty(obj){
  return (Object.getOwnPropertyNames(obj).length === 0);
}

/**
 * Print the pixel array to the console.
 * @param {array of objects} pixels - Array of Pixels.
 * @param {number} width - Width of the image.
 * @param {number} height - Height of the image.
 */
function printPixelArray(pixels, width, height) {
  var pString = '';
  for (var row = 0; row < height; row++) {
    for (var col = 0; col < width; col++) {
      var index = row * width + col;
      pString += pixels[index] + ', ';
    }
    console.log(pString);
    pString = '';
  }
}

/**
 * Print the Uint8ClampedArray to the console.
 * @param {Uint8ClampedArray} array - Array of Uint8 values.
 * @param {number} width - Width of the image.
 * @param {number} height - Height of the image.
 */
function printUint8(array, width, height) {
  var aString = '';
  for (var row = 0; row < height; row++) {
    for (var col = 0; col < width; col++) {
      var index = row * width * 4 + col * 4;
      aString += '[' + array[index] + ', ';
      aString += array[index + 1] + ', ';
      aString += array[index + 2] + ', ';
      aString += array[index + 3] + '], ';
    }
    console.log(aString);
    aString = '';
  }
}
