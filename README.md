#Content Aware Resizing of Images (CARI)

CARI is a seam carving algorithm based on [this paper](http://graphics.cs.cmu.edu/courses/15-463/2007_fall/hw/proj2/imret.pdf), implemented in the browser.

It uses the shortest path algorithm to find rows and columns in the image that contain least information (expressed in the form of "energy").
Those rows / columns are deleted first when the image is downsized.

## About
This is an experimental implementation of the algorithm in the browser. It is a work in progress.
Test the application in the [Demo](http://katharinaxeniakufieta.github.io/cari/).

## Dependencies
No dependencies yet. Will be introduced once I add TypeScript.

### CSS Framework
The CSS Framework used in this project is [MaterialzeCSS](http://materializecss.com/).

### JavaScript
Future versions will use [TypeScript](https://www.typescriptlang.org/index.html). For now it is still pure JavaScript.

## Author
The code is written by [Katharina Kufieta](https://www.linkedin.com/in/katharinakufieta).
