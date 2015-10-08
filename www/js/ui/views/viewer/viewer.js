///////////////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Philippe Leefsma 2014 - ADN/Developer Technical Services
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
///////////////////////////////////////////////////////////////////////////////
'use strict';

require("../../../extensions/Autodesk.ADN.Viewing.Extension.Treeview");
require("./Autodesk.ADN.Viewing.Extension.Physics");
require("./Autodesk.ADN.Viewing.Extension.TransformTool");

var configClient = require("../../../config-client");

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
angular.module('Autodesk.ADN.MongoSample.View.Viewer',
  [
    'ngRoute',
    'Autodesk.ADN.Toolkit.Directive.Viewer'
  ])

  ///////////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////////
  .config(['$routeProvider',

    function($routeProvider) {

      $routeProvider.when('/viewer', {
        templateUrl: './js/ui/views/viewer/viewer.html',
        controller: 'Autodesk.ADN.MongoSample.View.Viewer.Controller'
      });
    }])

  ///////////////////////////////////////////////////////////////////////////
  //
  //
  ///////////////////////////////////////////////////////////////////////////
  .controller('Autodesk.ADN.MongoSample.View.Viewer.Controller',
  ['$scope', '$http', '$compile', 'ViewAndData', function(
    $scope, $http, $compile, ViewAndData) {

    $scope.tokenUrl = configClient.ApiURL + '/token';

    ///////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////
    $scope.searchFilter = function (model) {

      var regExp = new RegExp($scope.modelsFilterValue, 'i');

      return !$scope.modelsFilterValue ||
        regExp.test(model.name);
    };

    ///////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////
    function getClientSize() {

      var w = window,
        d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        sx = w.innerWidth || e.clientWidth || g.clientWidth,
        sy = w.innerHeight || e.clientHeight || g.clientHeight;

      return { x: sx, y: sy };
    }

    ///////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////
    function initialize() {

      $scope.viewer = null;

      $scope.selectedPath = [];

      $scope.selectedModel = null;

      $scope.viewerContainerConfig = {

        environment: 'AutodeskProduction'
        //environment: 'AutodeskStaging'
      }

      $scope.viewerConfig = {

        height: "1000px",
        lightPreset: 8,
        viewerType: 'GuiViewer3D',
        qualityLevel: [true, true],
        navigationTool: 'freeorbit',
        progressiveRendering: true,
        backgroundColor: [3, 4, 5, 250, 250, 250]
      };

      $scope.$on('ui.layout.resize', function (event, data) {

        setTimeout(resize, 350);
      });

      $(window).resize(resize);

      resize();
    }

    function resize() {

      var size = getClientSize();

      $('#main-container').height(size.y - 80);

      if ($scope.viewer) {

        $scope.viewerConfig.height = size.y - 80 + "px";

        $($scope.viewer.container).height(
          size.y - 80);

        $scope.viewer.resize();
      }
    }

    ///////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////
    $scope.onViewablePath = function(pathInfoCollection) {

      $scope.selectedPath = [pathInfoCollection.path3d[0].path];
    };

    ///////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////
    $scope.onViewerFactoryInitialized = function (factory) {

      $http.get(configClient.host + '/api/models').then(

        function(response) {

          $scope.models = response.data;

          $scope.models.forEach(function(model){

            model.thumbnail = 'resources/img/adsk.png';

            var fileId = ViewAndData.client.fromBase64(model.urn);

            ViewAndData.client.getThumbnail(fileId, function(data){

              model.thumbnail = "data:image/png;base64," + data;
            });
          });

          $scope.onModelSelected($scope.models[0])
        });
    };

    ///////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////
    $scope.onPathLoaded = function (viewer, path) {

    };

    ///////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////
    var _gravity = {x: 0, y: 0, z: -9.8};

    function getGravity() {

      return _gravity;
    };

    $scope.$on('event.Gravity', function (event, data) {

      if(data.gravity) {

        _gravity = {x: 0, y: 0, z: -9.8};
      }
      else {
        _gravity = {x: 0, y: 0, z: 0};
      }
    });

    ///////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////
    $scope.onViewerInitialized = function (viewer) {

      $scope.viewer = viewer;

      resize();

      viewer.addEventListener(
        Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
        onGeometryLoaded);
    };

    function onGeometryLoaded() {

      $scope.viewer.removeEventListener(
        Autodesk.Viewing.GEOMETRY_LOADED_EVENT,
        onGeometryLoaded);

      $scope.viewer.loadExtension(
        'Autodesk.ADN.Viewing.Extension.Physics',
        {
          compile: compile,
          getGravity: getGravity
        });

      $scope.viewer.loadExtension(
        'Autodesk.ADN.Viewing.Extension.TransformTool');
    }

    function compile(html) {

      return $compile(html)($scope);
    }

    ///////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////
    $scope.onModelSelected = function(model) {

      if(!$scope.selectedModel || $scope.selectedModel._id !== model._id) {

        $scope.selectedModel = model;

        $scope.selectedPath = [];
      }
    }

    ///////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////
    $scope.onDestroy = function (viewer) {

      viewer.finish();

      viewer = null;

      $scope.viewer = null;
    };

    ///////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////
    initialize();

  }]);