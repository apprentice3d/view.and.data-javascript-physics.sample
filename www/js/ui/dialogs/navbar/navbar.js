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

///////////////////////////////////////////////////////////////////////////////
//
//
///////////////////////////////////////////////////////////////////////////////
angular.module('Autodesk.ADN.MongoSample.Dialog.Navbar',
    [
        'Autodesk.ADN.MongoSample.Dialog.About'
    ])

    ///////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////
    .controller('Autodesk.ADN.MongoSample.Dialog.Navbar.Controller',

    function($scope) {

        $scope.brand = "View & Data API - Physics";

        $scope.brandImg = "resources/img/adsk/adsk-32x32-32.png";

        var gravity = true;

        $scope.gravity = "Disable Gravity";

        $scope.aboutItems = [
            {
                text: 'Get an API key',
                href: 'http://developer.autodesk.com',
                icon: 'glyphicon glyphicon-check'
            },
            {
                text: 'API Support',
                href: 'http://forums.autodesk.com/t5/Web-Services-API/ct-p/94',
                icon: 'glyphicon glyphicon-thumbs-up'
            },
            {
                text: 'Autodesk',
                href: 'http://www.autodesk.com',
                icon: 'glyphicon glyphicon-text-background'
            },
            {
                class: 'divider'
            },
            {
                text: 'Source on Github',
                href: 'https://github.com/Developer-Autodesk/view-and-data-physics',
                icon: 'glyphicon glyphicon-floppy-save'
            },
            {
                text: 'About that sample',
                href: '',
                icon: 'glyphicon glyphicon-info-sign',
                onClick: function() {
                    $('#aboutDlg').modal('show');
                }
            }
        ];

        $scope.toggleGravity = function() {

            gravity = !gravity;

            $scope.gravity = (gravity ? 'Disable':'Enable') + " Gravity";

            $scope.$emit('app.EmitMessage', {
                msgId:'event.Gravity',
                msgArgs: {
                    gravity: gravity
                }
            });
        };
    });