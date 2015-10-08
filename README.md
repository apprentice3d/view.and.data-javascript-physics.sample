#Autodesk view and data API Physics Sample

##Description

Realtime physics modeling demo with View & Data API using [ammo.js](https://github.com/kripken/ammo.js/)

##Setup/Usage Instructions

* See standard View & Data setup on [other samples](https://github.com/Developer-Autodesk/workflow-node.js-view.and.data.api)
* This sample is using a mongoDB database hosted on [mongolab](https://mongolab.com/) which provides a free tier.
* You need to change to your own mongoDB database as you will be using different models. Go to config-server.js, replace the access information of your mongoDB.
* Populate you DB with valid URNs, see [physics database](http://viewer.autodesk.io/node/physics/api/models) for an example
* Run the server: "node server.js" from command line
* Connect to server locally using a WebGL-compatible browser: http://localhost:3000/node/physics.

## Build the sample

    npn install
    gulp

## Live demo

[View & Data Physics](http://physics.autodesk.io)

## License

That samples are licensed under the terms of the [MIT License](http://opensource.org/licenses/MIT). Please see the [LICENSE](LICENSE) file for full details.

##Written by 

Written by [Philippe Leefsma](http://adndevblog.typepad.com/cloud_and_mobile/philippe-leefsma.html)

