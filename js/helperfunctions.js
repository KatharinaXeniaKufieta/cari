function isEmpty(obj){
  return (Object.getOwnPropertyNames(obj).length === 0);
}

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
