# Content Aware Resizing of Images (CARI)

CARI is a seam carving algorithm based on [this paper](http://graphics.cs.cmu.edu/courses/15-463/2007_fall/hw/proj2/imret.pdf), implemented in the browser.

It uses the shortest path algorithm to find rows and columns in the image that contain least information (expressed in the form of "energy").
Those rows / columns are deleted first when the image is downsized.

Test the application in the [Demo](http://kkufieta.github.io/cari/).

## How to use the application
So far the user can follow these steps:

1. Choose and upload a picture
2. Define how much to reduce the picture in width and height, either through entering the number of pixels, or through drag- & drop of the borders and corners of the image.
3. Press "Start Resizing"

## Dependencies
### CSS Framework
The CSS Framework used in this project is [MaterialzeCSS](http://materializecss.com/).

### JavaScript
The design of the program is based on MVVM and uses [Knockout.js](http://knockoutjs.com/) as a framework.

## Download
Simply clone the game with

`git clone https://github.com/kkufieta/cari.git`

or [download it here](https://github.com/kkufieta/cari/archive/master.zip).



## In-between steps during the development
1. I started developing this program before I knew how to use design patterns, what MVVM is and how to use Knockout.js. Once I learned all that, I needed to refactor the code and incorporate Knockout.js, before I continued adding more features. In order to understand how to combine Knockout and HTML5 Canvas, I developed this small example on [JSFiddle](https://jsfiddle.net/katharinaxeniakufieta/ateos0x2/).
2. I needed an implementation to resize the image inside the canvas by dragging and dropping the borders and corners of the image. This will give the user an intuitive interface to resize their pictures. I implemented this function on [JSFiddle](https://jsfiddle.net/katharinaxeniakufieta/sbf3tsnz/).

## TO DO / Collaboration sought to do
The list of To-Dos is as follows:

1. Put the seam carving calculations into a webworker so the app will not freeze during calculations.
2. Add a % bar to show progress of (pre-) calculations, calculate estimated time until finished and show to the user. (webworker has to be implemented first)
3. Give option to download resized picture, or even download all pictures (e.g. including seams and energy picture) in a zip file.
4. Add links & information about seamcarver, link to the paper, and to images that are an example.
5. Add a link to my linkedin & github pages.
6. Maybe: Precalculate 3 versions on how to resize picture: Width, height and diagonally (which could be width & height alternating). Allow the user to decide the direction by dragging the original picture. Possibly precalculate 25%, 50% and 75% sizes of the image for faster real-time resizing.

## Author
The code is written by [Katharina Kufieta](https://www.linkedin.com/in/katharinakufieta).
