/* global angular, THREE, $, webvrui, _, TweenMax, WEBVR */
angular.module('ua5App')
    .factory('SpaceFactory', ['$rootScope', '$q', 'BrowserFactory', function($rootScope, $q, BrowserFactory) {
        var scene;
        var camera;
        var renderer;
        var activeElement;
        var activeController;
        var mouseRaycaster;
        var renderItems = [];
        var previousIntersectId = false;
        var mouse = new THREE.Vector2();
        var itemsMouseCanHit = [];
        var controllers = [];
        var CONTROLLER = {
            MOUSE: 'controllerMouse',
            VIVE: 'controllerVive',
            DAYDREAM: 'controllerDaydream',
            GEAR: 'controllerGear',
            UNIVERSAL: 'controllerUniversal',
            GAZE: 'controllerCardboard',
        };
        var crosshair;
        var Crosshair = function() {

            var backGeo;
            var backMat;
            var backMesh;

            var midGeo;
            var midMat;
            var midMesh;

            var frontGeo;
            var frontMat;
            var frontMesh;

            var isEnabled = true;
            var isVisible = false;

            backGeo = new THREE.SphereGeometry(0.1, 25, 25);
            backMat = new THREE.MeshBasicMaterial({color: 0xffffff, opacity: 0.0, transparent: true});
            backMesh = new THREE.Mesh(backGeo, backMat);
            backMat.depthWrite = false;
            backMesh.position.set(0, 0, -5);

            midGeo = new THREE.SphereGeometry(0.06, 25, 25);
            midMat = new THREE.MeshBasicMaterial({color: 0x333333, opacity: 0.0, transparent: true});
            midMesh = new THREE.Mesh(midGeo, midMat);
            midMat.depthWrite = false;
            midMesh.position.set(0, 0, -5);

            frontGeo = new THREE.SphereGeometry(0.04, 25, 25);
            frontMat = new THREE.MeshBasicMaterial({color: 0xffffff, opacity: 0.0, transparent: true});
            frontMat.depthWrite = false;
            frontMesh = new THREE.Mesh(frontGeo, frontMat);
            frontMesh.position.set(0, 0, -5);

            //add in in front of our camera:
            camera.add(backMesh);
            camera.add(midMesh);
            camera.add(frontMesh);

            return {
                // enable: function (){
                //     isEnabled = true;
                // },
                // disable: function (){
                //     isEnabled = false;
                // },
                start: function(onComplete) {
                    if (isEnabled) {
                        TweenMax.to(midMesh.scale, 0.5, {x: 2, y: 2});
                        TweenMax.to(midMesh.scale, 0.5, {x: 1, y: 1, delay: 0.5});
                    }
                },
                show: function() {
                    if (isEnabled && !isVisible) {
                        TweenMax.to(backMat, 0.2, {opacity: 0.3});
                        TweenMax.to(midMat, 0.2, {opacity: 0.4});
                        TweenMax.to(frontMat, 0.2, {opacity: 0.9});
                        isVisible = true;
                    }
                },
                hide: function() {
                    if (isVisible) {
                        TweenMax.to(backMat, 0.2, {opacity: 0.0});
                        TweenMax.to(midMat, 0.2, {opacity: 0.0});
                        TweenMax.to(frontMat, 0.2, {opacity: 0.0});
                        isVisible = false;
                    }
                }
            }
        };
        var $$el;
        var elWidth;
        var elHeight;

        function init(_$$el, _renderer) {
            var FAR = 2000;
            var FOV = 50;
            var NEAR = 0.1;
            var controls;

            //  Does this browser support the WebVR API?
            //  Here’s how to download and configure one that does:
            //  https://webvr.rocks
            WEBVR.checkAvailability().catch(function(message){
                document.body.appendChild( WEBVR.getMessageContainer( message ))
            });

            // Default controller is mouse
            activeController = CONTROLLER.MOUSE;

            renderer = _renderer;
            mouseRaycaster = new THREE.Raycaster();

            //  We need a renderer.
            renderer.setPixelRatio( window.devicePixelRatio );
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.vr.enabled = false;
            renderer.vr.standing = true;
            _$$el.append(renderer.domElement);
            $$el = _$$el;

            //  Once we create the camera we’ll attach it to the scene. This is usually
            //  not necessary, but we’re going to attach a crosshair to it
            camera = new THREE.PerspectiveCamera(FOV, window.innerWidth / window.innerHeight, NEAR, FAR);
            scene = new THREE.Scene();
            scene.add(camera);

            //  Create our crosshair and show it
            crosshair = new Crosshair();
            crosshair.show();


            //  This button is important. It toggles between normal in-browser view
            //  and the brand new WebVR in-your-goggles view!
            WEBVR.getVRDisplay(function(display) {
                renderer.vr.setDevice(display);
                document.body.appendChild(WEBVR.getButton( display, renderer.domElement));
            });


            //  If we're on a touch device, use Accelerometer to navigate the space
            if (BrowserFactory.hasTouch()) {
                controls = new THREE.DeviceOrientationControls(camera, true);
                controls.connect();
            } else {
                controls = new THREE.OrbitControls(camera, renderer.domElement);
                controls.enableDamping = true;
                controls.dampingFactor = 0.25;
                controls.target = new THREE.Vector3(Math.PI, 0, -Math.PI * 4);
                controls.noPan = true;
                controls.noZoom = true;
            }

            function onWindowResize() {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
                elWidth = $$el.width();
                elHeight = $$el.height();
            }
            window.addEventListener('resize', onWindowResize, false);
            onWindowResize();

            $$el.on('mousedown', function () {
                startDragX = camera.position.x.toPrecision(3);
            });

            $$el.on('mouseup', function () {
                if (startDragX === camera.position.x.toPrecision(3)) {
                    clickhandler();
                }
            });

            $$el.on('mousemove', function(event) {
                activeController = CONTROLLER.MOUSE;
                setCursorPosition(
                    event.clientX -  $$el.offset().left + $(window).scrollLeft(),
                    event.clientY -  $$el.offset().top + $(window).scrollTop()
                );
            });

            //  Check this out: When THREE.VRController finds a new controller
            //  it will emit a custom “vr controller connected” event on the
            //  global window object. It uses this to pass you the controller
            //  instance and from there you do what you want with it.
            window.addEventListener('vr controller connected', function(event) {
                var controllerMaterial;
                var controllerMesh;
                var handleMesh;
                var controller;
                //  Here it is, your VR controller instance.
                //  It’s really a THREE.Object3D so you can just add it to your scene:

                controller = event.detail;
                controller.name = 'controller';
                scene.add(controller);


                //  HEY HEY HEY! This is important. You need to make sure you do this.
                //  For standing experiences (not seated) we need to set the standingMatrix
                //  otherwise you’ll wonder why your controller appears on the floor
                //  instead of in your hands! And for seated experiences this will have no
                //  effect, so safe to do either way:
                controller.standingMatrix = renderer.vr.getStandingMatrix();


                //  And for 3DOF (seated) controllers you need to set the controller.head
                //  to reference your camera. That way we can make an educated guess where
                //  your hand ought to appear based on the camera’s rotation.
                controller.head = camera;


                //  Right now your controller has no visual.
                //  It’s just an empty THREE.Object3D.
                //  Let’s fix that!
                controllerMaterial = new THREE.MeshNormalMaterial({
                    transparent: true,
                    opacity: 0.5
                });
                controllerMesh = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.03, 0.03, 0.2, 30 ),
                    controllerMaterial
                );
                handleMesh = new THREE.Mesh(
                    new THREE.CylinderGeometry( 0.004, 0.02, 10000, 10 ),
                    controllerMaterial
                );

                controllerMaterial.flatShading = true;
                controllerMesh.rotation.x = - Math.PI / 2;
                handleMesh.position.y = 5000;
                controllerMesh.add(handleMesh);
                controller.userData.mesh = controllerMesh;
                controller.add(controllerMesh);
                controllerMesh.rotation.x = -Math.PI / 2;
                controllerMesh.position.z = 0.1;

                controllers.push({
                    controller: controller,
                    mesh: controllerMesh,
                    raycaster: new THREE.Raycaster()
                });

                //  Button events. How easy is this?!
                //  We’ll just use the “primary” button -- whatever that might be ;)
                //  Check out the THREE.VRController.supported{} object to see
                //  all the named buttons we’ve already mapped for you!
                controller.addEventListener( 'primary press began', function( event ){
                    //guiInputHelper.pressed( true )
                });

                controller.addEventListener( 'primary press ended', function( event ){
                    //guiInputHelper.pressed( false )
                    activeController = CONTROLLER.UNIVERSAL;
                    clickhandler();
                });

                controller.addEventListener( 'disconnected', function( event ){
                    controller.parent.remove(controller)
                });
            });

            // Support for GearVR headset button click
            function addVRClickListener(clickCallback) {
                var lastButtonState = [];
                var presentingDisplay = null;

                // Set up a loop to check gamepad state while any VRDisplay is presenting.
                function onClickListenerFrame() {
                    var gamepads;
                    // Only reschedule the loop if a display is still presenting.
                    if (presentingDisplay && presentingDisplay.isPresenting) {
                        presentingDisplay.requestAnimationFrame(onClickListenerFrame);
                    }

                    gamepads = navigator.getGamepads();
                    for (var i = 0; i < gamepads.length; i++) {
                        var gamepad = gamepads[i];
                        // Ensure the gamepad is valid and has buttons.
                        if (gamepad &&
                            gamepad.buttons.length) {
                            var lastState = lastButtonState[i] || false;
                            var newState = gamepad.buttons[0].pressed;
                            // If the primary button state has changed from not pressed to pressed
                            // over the last frame then fire the callback.

                            if (newState && !lastState) {
                                clickCallback(gamepad);
                            }
                            lastButtonState[i] = newState;
                        }
                    }
                }

                window.addEventListener('vrdisplaypresentchange', function(event) {
                    if (event.display.isPresenting) {
                        var scheduleFrame = !presentingDisplay;
                        presentingDisplay = event.display;
                        if (scheduleFrame) {
                            onClickListenerFrame();
                        }
                    } else if (presentingDisplay === event.display) {
                        presentingDisplay = null;
                    }
                });
            }
            addVRClickListener(clickhandler);

            function update(){
                //  Here’s VRController’s UPDATE goods right here:
                //  This one command in your animation loop is going to handle
                //  all the VR controller business you need to get done!
                THREE.VRController.update();

                _.each(renderItems, function(item) {
                    if (item && item.tick) {
                        item.tick();
                    }
                });

                if (renderer.vr && renderer.vr.getDevice() && renderer.vr.getDevice().isPresenting) {
                    if (!renderer.vr.enabled) {
                        renderer.vr.enabled  = true;
                    }
                    if (controllers && controllers.length > 0) {
                        _.each(controllers, function (controller) {
                            if (controller.lastX !== controller.controller.rotation.x.toPrecision(2)) {
                                activeController = CONTROLLER.UNIVERSAL;
                                controller.lastX = controller.controller.rotation.x.toPrecision(2);
                                controllerIdleCheck = Date.now();
                                crosshair.hide();
                            } else {
                                if (Date.now() - controllerIdleCheck > 1000) {
                                    activeController = CONTROLLER.GAZE;
                                    crosshair.show();
                                }
                            }
                        });
                    } else {
                        setCursorPosition(elWidth / 2, elHeight / 2);
                        crosshair.show();
                    }
                } else {
                    if (renderer.vr.enabled) {
                        renderer.vr.enabled = false;
                    }
                    if (BrowserFactory.hasTouch()) {
                        controls.update();
                    }
                    crosshair.hide();
                }
                activeElement = getHoveredElements();
                renderer.render(scene, camera);
            }
            renderer.animate(update);
        }

        function addItem(item, isInteractive, parent, gazable) {
            parent = (typeof parent === 'undefined') ? scene : parent;
            isInteractive = (typeof isInteractive === 'undefined') ? true : isInteractive;
            gazable = (typeof gazable === 'undefined') ? false : gazable;
            if (isInteractive) {
                registerItem(item);
            }
            item.gazable = gazable;
            parent.add(item);

            //refresh camera for pointer:
            scene.remove(camera);
            scene.add(camera);
        }

        // Fires the passed in onClick method, along with the element under it
        function clickhandler() {
            setTimeout(function() {
                var el = getHoveredElements();
                if (el) {
                    el = scene.getObjectById(el, true);
                    onClick(el);
                }
            }, 100);
        }

        function registerItem(item) {
            item.isVisible = true;
            itemsMouseCanHit.push(item);
        }

        function getHoveredElements() {
            var closestIntersect;
            var currentIntersectId;
            var intersects = [];

            switch (activeController) {
                case CONTROLLER.UNIVERSAL:
                    _.each(controllers, function(controller) {
                        var matrix = new THREE.Matrix4();
                        matrix.extractRotation(controller.controller.matrix);

                        var direction = new THREE.Vector3(0, 0, 1);
                        direction.applyMatrix4(matrix);
                        direction.normalize();
                        direction.multiplyScalar(-1);

                        var globalControllerPos = new THREE.Vector3();
                        globalControllerPos.setFromMatrixPosition(controller.mesh.matrixWorld);

                        controller.raycaster.set(globalControllerPos, direction);
                        intersects = intersects.concat(controller.raycaster.intersectObjects(itemsMouseCanHit, true));
                    });
                    break;
                case CONTROLLER.GAZE:
                    mouseRaycaster.setFromCamera(mouse, camera);
                    intersects = mouseRaycaster.intersectObjects(itemsMouseCanHit);
                    break;
                case CONTROLLER.MOUSE:
                default:
                    mouseRaycaster.setFromCamera(mouse, camera);
                    intersects = mouseRaycaster.intersectObjects(itemsMouseCanHit);
                    break;
            }

            // get the closest one
            intersects = _.sortBy(intersects, 'distance');
            intersects = _.reject(intersects, function(intersect) {
                return (
                    intersect.hasOwnProperty('object') &&
                    !intersect.object.isVisible
                );
            });

            if (intersects.length > 0) {
                closestIntersect = intersects[0].object;
                currentIntersectId = closestIntersect.id;

                if (previousIntersectId !== currentIntersectId) {

                    if (previousIntersectId) {
                        onMouseOut(scene.getObjectById(previousIntersectId, true));
                        if (scene.getObjectById(previousIntersectId, true)) {
                            scene.getObjectById(previousIntersectId, true).hovered = false;
                        }
                    }
                }

                if (currentIntersectId && !closestIntersect.hovered) {
                    onMouseOver(scene.getObjectById(currentIntersectId, true));
                    closestIntersect.hovered = true;
                }

                previousIntersectId = currentIntersectId;
            } else {
                //-- get the items that have been removed
                if (previousIntersectId) {
                    onMouseOut(scene.getObjectById(previousIntersectId, true));
                    if (scene.getObjectById(previousIntersectId, true)) {
                        scene.getObjectById(previousIntersectId, true).hovered = false;
                    }
                    previousIntersectId = false;
                }
            }
            return currentIntersectId;
        }

        function getActiveObject() {
            return scene.getObjectById(activeElement, true);
        }

        function setCursorPosition(x, y) {
            mouse.x = (x / elWidth) * 2 - 1;
            mouse.y = - (y / elHeight) * 2 + 1;
        }

        var onMouseOut = function(item) {
            //item.material.opacity = 0.6;
        };

        var onMouseOver = function(item) {
            //item.material.opacity = 1;
        };

        function destroyAllSceneObjects(skipTypes) {
            var i;
            skipTypes = (typeof skipTypes !== 'object') ? [] : skipTypes;
            i = scene.children.length;
            while (i--) {
                var obj = scene.children[i];
                // if our object is in the group of skip types, dont remove it
                if (_.indexOf(skipTypes, obj.type) === -1 && obj.name !== 'controller') {
                    console.log('delete', obj.type)
                    scene.remove(obj);
                    if (obj.geometry) {
                        obj.geometry.dispose();
                    }
                    if (obj.material) {
                        if (obj.material instanceof THREE.MeshFaceMaterial) {
                            _.each(obj.material.materials, function(obj, idx) {
                                obj.dispose();
                            });
                        } else {
                            obj.material.dispose();
                        }
                    }
                    if (obj.dispose) {
                        obj.dispose();
                    }
                    obj = undefined;
                }
            }
            itemsMouseCanHit = [];
            //camera.position.set(0, 10, 0);
        }

        return {
            init: init,
            addItem: addItem,
            activeObject: getActiveObject,
            registerItem: registerItem,
            getRenderer: function() {
                return renderer;
            },
            getScene: function() {
                return scene;
            },
            getCamera: function() {
                return camera;
            },
            setCursorPosition: setCursorPosition,
            destroyAllSceneObjects: destroyAllSceneObjects,
            setOnClick: function(clickEventHandler) {
                onClick = clickEventHandler;
            },
            setOnMouseOver: function() {},
            setOnMouseOut: function() {},
            pushItem: registerItem,
            addRenderItem: function(items) {
                renderItems.push(items);
            },
            resize: function() {}
        };
    }])
;
