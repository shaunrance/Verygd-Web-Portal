/* global angular, THREE, $, webvrui, _ */
angular.module('ua5App')
    .factory('SpaceFactory', ['$rootScope', '$q', function($rootScope, $q) {
        var scene;
        var controls;
        var effect;
        var animationDisplay;
        var lastRender = 0;
        var daydreamPad;
        var vivePad;
        var mouse = new THREE.Vector2();
        var itemsMouseCanHit = [];
        var previousIntersectId = false;
        var daydreamPointer;
        var vivePointer;
        var gamePadsCreated = false;
        var renderItems = [];
        var activeElement;
        var vrControls;

        var onClick = function() {};

        var onMouseOut = function(item) {
            //item.material.opacity = 0.6;
        };

        var onMouseOver = function(item) {
            //item.material.opacity = 1;
        };

        // Setup three.js WebGL renderer.
        var renderer = new THREE.WebGLRenderer();

        // Create perspective camera used in VR
        var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);

        // Create WebVR UI Enter VR Button
        var options = {
            injectCSS: false,
            textEnterVRTitle: ' ',
            textExitVRTitle: ' ',
            textVRNotFoundTitle: ' '
        };
        // Different states the vive controller/mouse could be in
        // vive controller should be the same as oculus
        var CONTROLLER = {
            MOUSE: 'controllerMouse',
            VIVE: 'controllerVive',
            DAYDREAM: 'controllerDaydream'
        };

        // We'll use this to save the last position, to detect movement
        var savedVive = -1;
        var savedDaydream = -1;

        var activeController;
        var $space;
        var $button;
        var $buttonUI;
        var $exit;
        var $spaceContainer;

        var mouseRaycaster;
        var viveRaycaster;
        var daydreamRaycaster;
        var defer = $q.defer();

        renderer.sortObjects = false;

        function isCardboard() {
            var _isCardboard = false;
            navigator.getVRDisplays()
            .then(function(displays) {
                for (var i = 0; i < displays.length; i++) {
                    if (displays[i].displayName.indexOf('Cardboard') > -1) {
                        _isCardboard = true;
                    }
                }
                defer.resolve(_isCardboard);
            });
            return defer.promise;
        }

        function init(element, _vrOnly) {
            // Default controller is mouse
            activeController = CONTROLLER.MOUSE;
            $space = $(element).find('.space');
            $button = $('.webvr-button');

            $buttonUI = $(element).find('.button-ui');
            $exit = $(element).find('.exit-btn');
            $spaceContainer = $('.space-container');

            // Need these for our various controllers, to detect rollovers
            mouseRaycaster = new THREE.Raycaster();
            viveRaycaster = new THREE.Raycaster();
            daydreamRaycaster = new THREE.Raycaster();

            window.enterVR = new webvrui.EnterVRButton(renderer.domElement, options)
                .on('enter', function() {
                    $rootScope.$apply();
                    createGamePads();
                    $('.webvr-ui-button').addClass('webvr-ui--exit');
                })
                .on('exit', function() {
                    camera.quaternion.set(0, 0, 0, 1);
                    camera.position.set(0, controls.userHeight, 0);
                    $rootScope.inVR = false;
                    $rootScope.$apply();
                    $('.webvr-ui-button').removeClass('webvr-ui--exit');
                    // controls.minPolarAngle = Math.PI / 2 - 0.6;
                    // controls.maxPolarAngle = Math.PI / 2 + 0.6;
                    //controls.noPan = true;
                    //controls.noZoom = true;

                })
                .on('error', function(error) {
                    //document.getElementById('learn-more').style.display = 'inline';
                    console.error(error);
                    $rootScope.inVR = false;
                    $('.webvr-ui-button').addClass('webvr-ui--exit');
                })
                .on('hide', function() {
                    $buttonUI.hide();
                    // On iOS there is no button to close fullscreen mode, so we need to provide one
                    if (window.enterVR.state === webvrui.State.PRESENTING_FULLSCREEN) {
                        $exit.show();
                    }
                })
                .on('show', function() {
                    $buttonUI.show();
                    $('.webvr-ui-button').removeClass('webvr-ui--exit');
                    $exit.hide();
                })
            ;

            // Add button to the #button element
            $button[0].appendChild(window.enterVR.domElement);

            //
            // WEBGL SCENE SETUP
            //

            // Append the canvas element created by the renderer to document body element.
            $spaceContainer.append(renderer.domElement);

            // Create a three.js scene.
            scene = new THREE.Scene();

            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.target.set(
              camera.position.x + 0.15,
              camera.position.y,
              camera.position.z
            );
            // controls.minPolarAngle = Math.PI / 2 - 0.6;
            // controls.maxPolarAngle = Math.PI / 2 + 0.6;
            controls.noPan = true;
            controls.noZoom = true;

            // Create VR Effect rendering in stereoscopic mode
            effect = new THREE.VREffect(renderer);
            effect.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.floor(window.devicePixelRatio));
            scene.add(camera);

            // Hande canvas resizing
            window.addEventListener('resize', onResize, true);
            window.addEventListener('vrdisplaypresentchange', onResize, true);

            // Get the HMD
            window.enterVR.getVRDisplay()
                .then(function(display) {
                    animationDisplay = display;
                    vrControls = new THREE.VRControls(camera);
                    vrControls.standing = true;
                    camera.position.y = vrControls.userHeight;

                    display.requestAnimationFrame(animate);
                })
                .catch(function() { // jshint ignore:line
                    // If there is no display available, fallback to window
                    animationDisplay = window;
                    window.requestAnimationFrame(animate);
                })
            ;

            $(renderer.domElement).on('click', clickhandler);
            $(renderer.domElement).on('mousemove', function(event) {
                if (!$rootScope.inVR) {
                    activeController = CONTROLLER.MOUSE;
                    setCursorPosition(
                        event.clientX - $(renderer.domElement).offset().left + $(window).scrollLeft(),
                        event.clientY - $(renderer.domElement).offset().top + $(window).scrollTop()
                    );
                }
            });
        }

        function onResize(e) {
            effect.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();

            $spaceContainer.css({
                width: window.innerWidth + 'px',
                height: window.innerHeight + 'px'
            });
            $space.css({
                width: window.innerWidth + 'px',
                height: window.innerHeight + 'px'
            });
        }

        function clickhandler() {
            setTimeout(function() {
                var el = getHoveredElements();
                if (el) {
                    el = scene.getObjectById(el, true);
                    onClick(el);
                }

            }, 100);
        }

        function createGamePads() {
            var lineGeometry;
            if (gamePadsCreated) {
                return;
            }
            gamePadsCreated = true;

            isCardboard().then(function(value) {
                if (value) {
                    $rootScope.inVR = true;
                    makeCrosshair();
                    setCursorPosition($(renderer.domElement).width() / 2, $(renderer.domElement).height() / 2);
                }
            });

            if (typeof navigator.getGamepads === 'undefined') {
                return;
            }

            daydreamPad = new THREE.DaydreamController();
            daydreamPad.addEventListener('touchpadup', clickhandler);
            daydreamPad.position.set(0.25, 1, 0);
            daydreamPad.name = 'controller';

            vivePad = new THREE.ViveController(0);
            vivePad.standingMatrix = vrControls.getStandingMatrix();
            vivePad.addEventListener('thumbpadup', clickhandler);
            vivePad.addEventListener('triggerup', clickhandler);
            vivePad.name = 'controller';

            scene.add(daydreamPad);
            scene.add(vivePad);

            daydreamPointer = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({linewidth: 3, color: 0x000000}));
            daydreamPointer.geometry.addAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, - 30], 3));

            lineGeometry = new THREE.Geometry();
            lineGeometry.vertices.push(new THREE.Vector3(0, 0, 0));
            lineGeometry.vertices.push(new THREE.Vector3(0, 0, -1000));
            vivePointer = new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({linewidth: 3}));
            //vivePointer.geometry.addAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, - 30], 3));

            daydreamPad.add(daydreamPointer);
            vivePad.add(vivePointer);
        }

        function makeCrosshair() {
            var backGeo;
            var backMat;
            var backMesh;

            var midGeo;
            var midMat;
            var midMesh;

            var frontGeo;
            var frontMat;
            var frontMesh;

            backGeo = new THREE.SphereGeometry(0.1, 25, 25);
            backMat = new THREE.MeshBasicMaterial({color: 0xffffff, opacity: 0.3, transparent: true});
            backMesh = new THREE.Mesh(backGeo, backMat);
            backMat.depthWrite = false;
            backMesh.position.set(0, 0, -5);

            midGeo = new THREE.SphereGeometry(0.06, 25, 25);
            midMat = new THREE.MeshBasicMaterial({color: 0x333333, opacity: 0.4, transparent: true});
            midMesh = new THREE.Mesh(midGeo, midMat);
            midMat.depthWrite = false;
            midMesh.position.set(0, 0, -5);

            frontGeo = new THREE.SphereGeometry(0.04, 25, 25);
            frontMat = new THREE.MeshBasicMaterial({color: 0xffffff, opacity: 0.9, transparent: true});
            frontMat.depthWrite = false;
            frontMesh = new THREE.Mesh(frontGeo, frontMat);
            frontMesh.position.set(0, 0, -5);

            //add in in front of our camera:
            camera.add(backMesh);
            camera.add(midMesh);
            camera.add(frontMesh);

            // return the mid crosshair, so we can animate it
            return midMesh;
        }

        function getHoveredElements() {
            var intersects;
            var closestIntersect;
            var currentIntersectId;
            var xPos;
            var matrix;
            var direction;
            var globalControllerPos;
            var prevObject;

            if (daydreamPad) {
                daydreamPad.update();

                // Check to see if Daydream controller is moving
                if (daydreamPad.position && daydreamPad.position.x) {
                    xPos = Math.round(daydreamPad.position.x * 10) / 10;
                    if (savedDaydream !== xPos) {
                        activeController = CONTROLLER.DAYDREAM;
                    }
                    savedDaydream = xPos;
                }
            }

            if (vivePad) {
                vivePad.update();

                matrix = new THREE.Matrix4();
                matrix.extractRotation(vivePad.matrix);

                direction = new THREE.Vector3(0, 0, 1);
                direction.applyMatrix4(matrix);
                direction.multiplyScalar(-1);

                globalControllerPos = new THREE.Vector3();
                globalControllerPos.setFromMatrixPosition(vivePad.matrixWorld);

                // Check to see if Vive controller is moving
                if (vivePad.position && vivePad.position.x) {
                    xPos = Math.round(vivePad.position.x * 10) / 10;

                    if (savedVive !== xPos) {
                        activeController = CONTROLLER.VIVE;
                    }
                    savedVive = xPos;
                }
            }

            switch (activeController) {
                case CONTROLLER.DAYDREAM:
                    daydreamRaycaster.ray.origin.copy(daydreamPad.position);
                    daydreamRaycaster.ray.direction.set(0, 0, - 1).applyQuaternion(daydreamPad.quaternion);
                    intersects = daydreamRaycaster.intersectObjects(itemsMouseCanHit, true);
                    break;
                case CONTROLLER.VIVE:
                    viveRaycaster.set(globalControllerPos, direction);
                    intersects = viveRaycaster.intersectObjects(itemsMouseCanHit, true);
                    break;
                default:
                case CONTROLLER.MOUSE:
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
                        prevObject = scene.getObjectById(previousIntersectId, true);
                        if (typeof prevObject === 'object') {
                            onMouseOut(prevObject);
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
                    prevObject = scene.getObjectById(previousIntersectId, true);
                    if (typeof prevObject === 'object') {
                        onMouseOut(prevObject);
                        prevObject.hovered = false;
                    }
                    previousIntersectId = false;
                }
            }
            return currentIntersectId;
        }

        function setCursorPosition(x, y) {
            mouse.x = (x / $(renderer.domElement).width()) * 2 - 1;
            mouse.y = - (y / $(renderer.domElement).height()) * 2 + 1;
        }

        // Request animation frame loop function
        function animate(timestamp) {
            lastRender = timestamp;

            if (window.enterVR.isPresenting()) {
                if (vrControls) {
                    vrControls.update();
                }
                renderer.render(scene, camera);
                effect.render(scene, camera);
            } else {
                renderer.render(scene, camera);
            }

            _.each(renderItems, function(item) {
                if (item && item.tick) {
                    item.tick();
                }
            });

            activeElement = getHoveredElements();
            animationDisplay.requestAnimationFrame(animate);
        }

        // function startRendering() {

        // }

        // function stopRendering() {

        // }

        function addItem(item, isInteractive, parent) {
            parent = (typeof parent === 'undefined') ? scene : parent;
            isInteractive = (typeof isInteractive === 'undefined') ? true : isInteractive;
            if (isInteractive) {
                registerItem(item);
            }
            parent.add(item);

            //refresh camera for pointer:
            scene.remove(camera);
            scene.add(camera);
        }

        function registerItem(item) {
            item.isVisible = true;
            itemsMouseCanHit.push(item);
        }

        function getActiveObject() {
            return scene.getObjectById(activeElement, true);
        }

        function updateDimensions() {
            // var width = $$el.width();
            // var height = $$el.height();

            // camera.aspect = width / height;
            // camera.updateProjectionMatrix();
            // renderer.setSize(width, height);
        }

        function destroyAllSceneObjects(skipTypes) {
            var i;
            skipTypes = (typeof skipTypes !== 'object') ? [] : skipTypes;
            i = scene.children.length;
            while (i--) {
                var obj = scene.children[i];
                // if our object is in the group of skip types, dont remove it
                if (_.indexOf(skipTypes, obj.type) === -1 && obj.name !== 'controller') {
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
            setOnMouseOver: function(mouseOverEventHandler) {
                onMouseOver = mouseOverEventHandler;
            },
            setOnMouseOut: function(mouseOutEventHandler) {
                onMouseOut = mouseOutEventHandler;
            },
            pushItem: function(item) {
                itemsMouseCanHit.push(item);
                item.isVisible = true;
            },
            addRenderItem: function(items) {
                renderItems.push(items);
            },
            resize: updateDimensions
        };
    }])
;
