///////////////////////////////////////////////////////////////////////////////
// Ammo.js Physics viewer extension
// by Philippe Leefsma, December 2014
//
// Dependencies:
//
// https://rawgit.com/kripken/ammo.js/master/builds/ammo.js
// https://rawgit.com/darsain/fpsmeter/master/dist/fpsmeter.min.js
// https://rawgit.com/vitalets/angular-xeditable/master/dist/js/xeditable.min.js
///////////////////////////////////////////////////////////////////////////////

AutodeskNamespace("Autodesk.ADN.Viewing.Extension");

Autodesk.ADN.Viewing.Extension.Physics = function (viewer, options) {

    Autodesk.Viewing.Extension.call(this, viewer, options);

    var _fps = null;

    var _self = this;

    var _panel = null;

    var _world = null;

    var _meshMap = {};

    var _viewer = viewer;

    var _started = false;

    var _running = false;

    var _animationId = null;

    var _selectedEntry = null;

    ///////////////////////////////////////////////////////////////////////////
    // A stopwatch!
    //
    ///////////////////////////////////////////////////////////////////////////
    var Stopwatch = function() {

        var _startTime = new Date().getTime();

        this.start = function (){

            _startTime = new Date().getTime();
        };

        this.getElapsedMs = function(){

            var elapsedMs = new Date().getTime() - _startTime;

            _startTime = new Date().getTime();

            return elapsedMs;
        }
    }

    var _stopWatch = new Stopwatch();

    String.prototype.replaceAll = function (find, replace) {
        return this.replace(
            new RegExp(find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'),
            replace);
    };

    ///////////////////////////////////////////////////////////////////////////
    // Extension load callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.load = function () {

        _self.initialize(function() {

            _panel = _self.loadPanel();

            _viewer.addEventListener(
                Autodesk.Viewing.SELECTION_CHANGED_EVENT,
                _self.onItemSelected);

            console.log('Autodesk.ADN.Viewing.Extension.Physics loaded');
        });

        return true;
    };

    ///////////////////////////////////////////////////////////////////////////
    // Extension unload callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.unload = function () {

        $('#physicsDivId').remove();

        _panel.setVisible(false, true);

        _panel = null;

        _self.stop();

        console.log('Autodesk.ADN.Viewing.Extension.Physics unloaded');

        return true;
    };

    ///////////////////////////////////////////////////////////////////////////
    // Initializes meshes and grab initial properties
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.initialize = function(callback) {

        _viewer.getObjectTree(function (rootComponent) {

            rootComponent.children.forEach(function(component) {

                var fragIdsArray = (Array.isArray(component.fragIds) ?
                    component.fragIds :
                    [component.fragIds]);

                fragIdsArray.forEach(function(subFragId) {

                    var mesh = _viewer.impl.getRenderProxy(
                        _viewer,
                        subFragId);

                    _viewer.getPropertyValue(
                        component.dbId,
                        "Mass", function(mass) {

                        mass = (mass !== 'undefined' ? mass : 1.0);

                        _viewer.getPropertyValue(
                            component.dbId,
                            "vInit",
                            function (vInit) {

                                vInit =
                                (vInit !== 'undefined' ? vInit : "0;0;0");

                                vInit = parseArray(vInit, ';');

                                _meshMap[subFragId] = {
                                   transform: mesh.matrixWorld.clone(),
                                   component: component,

                                   vAngularInit: [0,0,0],
                                   vAngular: [0,0,0],

                                   vLinearInit: vInit,
                                   vLinear: vInit,

                                   mass: mass,
                                   mesh: mesh,
                                   body: null
                                }
                            });
                    });
                });
            });

            //done
            callback();
        });
    }

    ///////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.displayVelocity = function(vLinear, vAngular) {

        var editable = angular.element($("#editableDivId")).scope();

        editable.editables.vx = parseFloat(vLinear[0].toFixed(3));
        editable.editables.vy = parseFloat(vLinear[1].toFixed(3));
        editable.editables.vz = parseFloat(vLinear[2].toFixed(3));

        editable.editables.ax = parseFloat(vAngular[0].toFixed(3));
        editable.editables.ay = parseFloat(vAngular[1].toFixed(3));
        editable.editables.az = parseFloat(vAngular[2].toFixed(3));
    }

    ///////////////////////////////////////////////////////////////////////////
    // item selected callback
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.onItemSelected = function (event) {

        var dbId = event.dbIdArray[0];

        if(typeof dbId === 'undefined') {
            $('#editableDivId').css('visibility','collapse');
            return;
        }

        $('#editableDivId').css('visibility','visible');

        var fragId = event.fragIdsArray[0]

        var fragIdsArray = (Array.isArray(fragId) ?
            fragId :
            [fragId]);

        var subFragId = fragIdsArray[0];

        var vLinear = _meshMap[subFragId].vLinear;

        var vAngular = _meshMap[subFragId].vAngular;

        _self.displayVelocity(vLinear, vAngular);

        _selectedEntry = _meshMap[subFragId];
    }

    ///////////////////////////////////////////////////////////////////////////
    // Creates control panel
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.loadPanel = function() {

        Autodesk.ADN.Viewing.Extension.Physics.ControlPanel = function(
            parentContainer,
            id,
            title,
            content,
            x, y)
        {
            this.content = content;

            Autodesk.Viewing.UI.DockingPanel.call(
                this,
                parentContainer,
                id, '',
                {shadow:true});

            // Auto-fit to the content and don't allow resize.
            // Position at the given coordinates

            this.container.style.top = y + "px";
            this.container.style.left = x + "px";

            this.container.style.width = "auto";
            this.container.style.height = "auto";
            this.container.style.resize = "none";
        };

        Autodesk.ADN.Viewing.Extension.Physics.
            ControlPanel.prototype = Object.create(
                Autodesk.Viewing.UI.DockingPanel.prototype);

        Autodesk.ADN.Viewing.Extension.Physics.
            ControlPanel.prototype.constructor =
                Autodesk.ADN.Viewing.Extension.Physics.ControlPanel;

        Autodesk.ADN.Viewing.Extension.Physics.ControlPanel.prototype.
          initialize = function() {

            this.title = this.createTitleBar(
              this.titleLabel ||
              this.container.id);

            this.closer = this.createCloseButton();

            this.container.appendChild(this.title);

            this.container.appendChild(this.content);

            this.initializeMoveHandlers(this.title);
        };

        var content = document.createElement('div');

        content.id = 'physicsDivId';

        var panel = new Autodesk.ADN.Viewing.Extension.Physics.
            ControlPanel(
                _viewer.container,
                'Physics',
                'Physics',
                content,
                0, 0);

        $('#physicsDivId').css('color', 'white');

        panel.setVisible(true);

        var format = '<a href="#" editable-number="editables.%1" ' +
            'e-step="any" e-style="width:100px" ' +
            'onaftersave="afterSave()">{{editables.%1}}</a>'

        var html =
            '<button id="startBtnId" type="button" style="color:#000000;width:100px">Start</button>' +
            '<button id="resetBtnId" type="button" style="color:#000000;width:100px">Reset</button>' +
            '<div id="editableDivId" ng-controller="editableController" style="visibility: collapse">' +
            '<br>' +
            '<br>&nbsp Linear Velocity: ' +
            '<br> &nbsp Vx = ' + format.replaceAll('%1', 'vx') +
            '<br> &nbsp Vy = ' + format.replaceAll('%1', 'vy') +
            '<br> &nbsp Vz = ' + format.replaceAll('%1', 'vz') +
            '<br><br>&nbsp Angular Velocity: ' +
            '<br> &nbsp Ax = ' + format.replaceAll('%1', 'ax') +
            '<br> &nbsp Ay = ' + format.replaceAll('%1', 'ay') +
            '<br> &nbsp Az = ' + format.replaceAll('%1', 'az') +
            '</div>'

        var element = options.compile(html);

        $('#physicsDivId').append(element);

        _self.displayVelocity([0,0,0], [0,0,0]);

        var editable = angular.element($("#editableDivId")).scope();

        editable.onAfterSave = function () {

            var editables = editable.editables;

            _selectedEntry.vAngular = [
                editables.ax,
                editables.ay,
                editables.az
            ];

            _selectedEntry.vLinear = [
                editables.vx,
                editables.vy,
                editables.vz
            ];

            if(!_started) {

                _selectedEntry.vAngularInit =
                    _selectedEntry.vAngular;

                _selectedEntry.vLinearInit =
                    _selectedEntry.vLinear;
            }
        }

        _fps = new FPSMeter(content, {
            smoothing: 10,
            show: 'fps',
            toggleOn: 'click',
            decimals: 1,
            zIndex: 999,
            left: '5px',
            top: '60px',
            theme: 'transparent',
            heat: 1,
            graph: 1,
            history: 32});

        $('#startBtnId').click(function () {

            if (_animationId) {

                $("#startBtnId").text('Start');

                _self.stop();
            }
            else {

                $("#startBtnId").text('Stop');

                _self.start();
            }
        })

        $('#resetBtnId').click(function () {

            if(_running) {

                $("#startBtnId").text('Start');

                _self.stop();
            }

            _self.reset();
        })

        return panel;
    }

    ///////////////////////////////////////////////////////////////////////////
    // Creates physics world
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.createWorld = function() {

        var collisionConfiguration =
            new Ammo.btDefaultCollisionConfiguration;

        var world = new Ammo.btDiscreteDynamicsWorld(
            new Ammo.btCollisionDispatcher(collisionConfiguration),
            new Ammo.btDbvtBroadphase,
            new Ammo.btSequentialImpulseConstraintSolver,
            collisionConfiguration);

        var gravity = options.getGravity();

        console.log(gravity)

        world.setGravity(new Ammo.btVector3(
          gravity.x,
          gravity.y,
          gravity.z
        ));

        return world;
    }

    ///////////////////////////////////////////////////////////////////////////
    // Starts simulation
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.start = function() {

        _viewer.select([]);

        // force update
        _viewer.setView(_viewer.getCurrentView());

        _world = _self.createWorld();

        for(var key in _meshMap){

            var entry = _meshMap[key];

            var body = createRigidBody(
                entry);

            _world.addRigidBody(body);

            entry.body = body;
        }

        _running = true;

        _started = true;

        _stopWatch.getElapsedMs();

        _self.update();
    }

    ///////////////////////////////////////////////////////////////////////////
    // Stops simulation
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.stop = function() {

        // save current velocities
        for(var key in _meshMap){

            var entry = _meshMap[key];

            var va = entry.body.getAngularVelocity();
            var vl = entry.body.getLinearVelocity();

            entry.vAngular = [va.x(), va.y(), va.z()]
            entry.vLinear = [vl.x(), vl.y(), vl.z()]
        }

        _running = false;
    }

    ///////////////////////////////////////////////////////////////////////////
    // Update loop
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.update = function() {

        if(!_running) {

            cancelAnimationFrame(_animationId);

            _animationId = null;

            return;
        }

        _animationId = requestAnimationFrame(
            _self.update);

        var dt = _stopWatch.getElapsedMs() * 0.002;

        dt = (dt > 0.5 ? 0.5 : dt);

        _world.stepSimulation(
           dt, 10);

        for(var key in _meshMap) {

            updateMeshTransform(_meshMap[key].body);
        }

        _viewer.impl.invalidate(true);

        _fps.tick();
    }

    ///////////////////////////////////////////////////////////////////////////
    // Reset simulation
    //
    ///////////////////////////////////////////////////////////////////////////
    _self.reset = function() {

        for(var key in _meshMap) {

            var entry = _meshMap[key];

            entry.mesh.matrixWorld =
                entry.transform.clone();

            entry.vAngular = entry.vAngularInit;

            entry.vLinear = entry.vLinearInit;
        }

        _viewer.impl.invalidate(true);

        _started = false;
    }

    ///////////////////////////////////////////////////////////////////////////
    // Parses string to array: a1;a2;a3 -> [a1, a2, a3]
    //
    ///////////////////////////////////////////////////////////////////////////
    function parseArray(str, separator) {

        var array = str.split(separator);

        var result = [];

        array.forEach(function(element){

            result.push(parseFloat(element));
        });

        return result;
    }

    ///////////////////////////////////////////////////////////////////////////
    // Updates mesh transform according to physic body
    //
    ///////////////////////////////////////////////////////////////////////////
    function updateMeshTransform(body) {

        var mesh = body.mesh;

        var transform = body.getCenterOfMassTransform();

        var origin = transform.getOrigin();

        var q = transform.getRotation();

        mesh.matrixWorld.makeRotationFromQuaternion({
            x: q.x(),
            y: q.y(),
            z: q.z(),
            w: q.w()
        });

        mesh.matrixWorld.setPosition(
            new THREE.Vector3(
                origin.x(),
                origin.y(),
                origin.z()));
    }

    ///////////////////////////////////////////////////////////////////////////
    // Returns mesh position
    //
    ///////////////////////////////////////////////////////////////////////////
    function getMeshPosition(mesh) {

        var pos = new THREE.Vector3();

        pos.setFromMatrixPosition(mesh.matrixWorld);

        return pos;
    }

    ///////////////////////////////////////////////////////////////////////////
    // Creates collision shape based on mesh vertices
    //
    ///////////////////////////////////////////////////////////////////////////
    function createCollisionShape(mesh) {

        var geometry = mesh.geometry;

        var hull = new Ammo.btConvexHullShape();

        var vertexBuffer = geometry.vb;

        for(var i=0; i < vertexBuffer.length; i += geometry.vbstride) {

            hull.addPoint(new Ammo.btVector3(
                vertexBuffer[i],
                vertexBuffer[i+1],
                vertexBuffer[i+2]));
        }

        return hull;
    }

    ///////////////////////////////////////////////////////////////////////////
    // Creates physic rigid body from mesh
    //
    ///////////////////////////////////////////////////////////////////////////
    function createRigidBody(entry) {

        var localInertia = new Ammo.btVector3(0, 0, 0);

        var shape = createCollisionShape(entry.mesh);

        shape.calculateLocalInertia(entry.mass, localInertia);

        var transform = new Ammo.btTransform;

        transform.setIdentity();

        var position = getMeshPosition(entry.mesh);

        transform.setOrigin(new Ammo.btVector3(
            position.x,
            position.y,
            position.z));

        var q = new THREE.Quaternion();

        q.setFromRotationMatrix(entry.mesh.matrixWorld);

        transform.setRotation(new Ammo.btQuaternion(
            q.x, q.y, q.z, q.w
        ));

        var motionState = new Ammo.btDefaultMotionState(transform);

        var rbInfo = new Ammo.btRigidBodyConstructionInfo(
            entry.mass,
            motionState,
            shape,
            localInertia);

        var body = new Ammo.btRigidBody(rbInfo);

        body.setLinearVelocity(
            new Ammo.btVector3(
                entry.vLinear[0],
                entry.vLinear[1],
                entry.vLinear[2]));

        body.setAngularVelocity(
            new Ammo.btVector3(
                entry.vAngular[0],
                entry.vAngular[1],
                entry.vAngular[2]));

        body.mesh = entry.mesh;

        return body;
    }

    ///////////////////////////////////////////////////////////////////////////
    //
    //
    ///////////////////////////////////////////////////////////////////////////
    viewer.getPropertyValue =

      function (dbId, displayName, callback) {

          function _cb(result) {

              if (result.properties) {

                  for (var i = 0; i < result.properties.length; i++) {

                      var prop = result.properties[i];

                      if (prop.displayName === displayName) {

                          callback(prop.displayValue);
                          return;
                      }
                  }

                  callback('undefined');
              }
          }

          this.getProperties(dbId, _cb);
      };

    ///////////////////////////////////////////////////////////////////////////
    // Get current view
    //
    ///////////////////////////////////////////////////////////////////////////
    viewer.getCurrentView =

      function (viewname) {

          var view = {

              id: newGuid(),
              name: viewname,

              position: this.navigation.getPosition(),
              target: this.navigation.getTarget(),
              fov: this.getFOV(),
              up: this.navigation.getCameraUpVector(),
              worldUp: this.navigation.getWorldUpVector(),
              explode: this.getExplodeScale()
          };

          return view;
      };

    ///////////////////////////////////////////////////////////////////////////
    // Set view
    //
    ///////////////////////////////////////////////////////////////////////////
    viewer.setView =

      function (view) {

          viewer.explode(view.explode);

          this.navigation.setRequestTransitionWithUp(
            true,

            new THREE.Vector3(
              view.position.x,
              view.position.y,
              view.position.z),

            new THREE.Vector3(
              view.target.x,
              view.target.y,
              view.target.z),

            view.fov,

            new THREE.Vector3(
              view.up.x,
              view.up.y,
              view.up.z));

          this.resize();
      };

    function newGuid() {

        var d = new Date().getTime();

        var guid = 'xxxx-xxxx-xxxx-xxxx-xxxx'.replace(
          /[xy]/g,
          function (c) {
              var r = (d + Math.random() * 16) % 16 | 0;
              d = Math.floor(d / 16);
              return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
          });

        return guid;
    };
};

Autodesk.ADN.Viewing.Extension.Physics.prototype =
    Object.create(Autodesk.Viewing.Extension.prototype);

Autodesk.ADN.Viewing.Extension.Physics.prototype.constructor =
    Autodesk.ADN.Viewing.Extension.Physics;

Autodesk.Viewing.theExtensionManager.registerExtension(
    'Autodesk.ADN.Viewing.Extension.Physics',
    Autodesk.ADN.Viewing.Extension.Physics);

