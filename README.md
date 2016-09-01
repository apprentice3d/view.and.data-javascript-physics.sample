# viewer-javascript sample
[![build status](https://travis-ci.org/apprentice3d/viewer-javascript-physics.sample.svg)](https://travis-ci.org/apprentice3d/viewer-javascript-physics.sample)
[![Node.js](https://img.shields.io/badge/Node.js-6.3.1-blue.svg)](https://nodejs.org/)
[![npm](https://img.shields.io/badge/npm-3.10.3-blue.svg)](https://www.npmjs.com/)
![Platforms](https://img.shields.io/badge/platform-windows%20%7C%20osx%20%7C%20linux-lightgray.svg)
[![License](http://img.shields.io/:license-mit-blue.svg)](http://opensource.org/licenses/MIT)


*Forge API*:
[![oAuth2](https://img.shields.io/badge/oAuth2-v1-green.svg)](http://developer-autodesk.github.io/)
[![Viewer](https://img.shields.io/badge/Forge%20Viewer-v2.10-green.svg)](http://developer-autodesk.github.io/)

## Live demo at

[View & Data Physics](http://physics.autodesk.io)

## Description

Realtime physics modeling demo with Autodesk Viewer using [ammo.js](https://github.com/kripken/ammo.js/)

## Dependencies

This sample is dependent of Node.js and few Node.js extensions which would update/install automatically via 'npm'.

1. Node.js - built on Chrome's JavaScript runtime for easily building fast, scalable network applications.
   You can get Node.js from [here](http://nodejs.org/).

2. MongoDB - NoSQL database, also having the option of using the free tier database at [mongolab](https://mongolab.com/).

3. ammo.js - A physics engine library available [here](https://github.com/kripken/ammo.js/), which is a direct port of the Bullet physics engine to JavaScript, using Emscripten.


## Setup/Usage Instructions

* Apply for your own credentials (API keys) from [developer.autodesk.com](http://developer.autodesk.com)
* Replace the placeholders with your own keys in config/config-view-and-data.js, line #22 and #23 <br />
  ```
  client_id: process.env.CONSUMERKEY || '<replace with your consumer key>',
  client_secret: process.env.CONSUMERSECRET || '<replace with your consumer secret>',
  ```
* This sample is using a mongoDB database hosted on [mongolab](https://mongolab.com/) which provides a free tier.
* You need to change to your own mongoDB database as you will be using different models. Go to config/config-server.js, replace the access information of your mongoDB.
* Populate you DB with valid URNs, see [physics database](http://viewer.autodesk.io/node/physics/api/models) for an example

## Build and run the sample

    npn install
    gulp

* Run the server:
    node server.js

* Connect to server locally using a WebGL-compatible browser: http://localhost:3000/node/physics



## License

That samples are licensed under the terms of the [MIT License](http://opensource.org/licenses/MIT). Please see the [LICENSE](./LICENSE) file for full details.

## Written by 

Written by [Philippe Leefsma](http://adndevblog.typepad.com/cloud_and_mobile/philippe-leefsma.html)

