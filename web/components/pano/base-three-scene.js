/* global angular, THREE, window, _, $, Stats */
angular.module('suite').factory('BaseThreeScene', ['$rootScope', 'BrowserFactory',
    function($rootScope, BrowserFactory) {
        return function() {

            var $$el;
            var activeElement = false;
            var activeElements = [];
            var animationFrameRequest;
            var camera;
            var controls;
            var effect;
            var itemsMouseCanHit = [];
            var mouse = new THREE.Vector2();
            var onMouseOut = function(item) {};
            var onMouseOver = function(item) {};
            var raycaster;
            var renderHook = function() {};
            var renderer;
            var rendering = true;
            var scene;
            var stats;
            var useVR = false;
            var debug = false;

            function getHoveredElements() {
                var elToMouseOver = false;
                var firstTouched = true;
                var hits = [];
                var intersects;
                var j;

                raycaster.setFromCamera(mouse, camera);
                intersects = raycaster.intersectObjects(itemsMouseCanHit);
                if (intersects.length > 0) {
                    j = intersects.length;
                    while (j--) {
                        if (
                            intersects[j].hasOwnProperty('object') &&
                            !intersects[j].object.isVisible
                        ) {
                            intersects.splice(j, 1);
                        }
                    }
                }

                if (intersects.length > 0) {

                    for (var i = 0; i < intersects.length; i ++) {
                        hits.push(intersects[i].object.id);
                        //-- store the new elements:
                        if (activeElement === intersects[i].object.id) {
                            elToMouseOver = intersects[i].object.id;
                            firstTouched = false;
                        }
                    }

                    if (!elToMouseOver) {
                        elToMouseOver = intersects[0].object.id;
                        if (activeElement) {
                            onMouseOut(scene.getObjectById(activeElement, true));
                            activeElement = false;
                        }
                    }

                    if (activeElement && !firstTouched) {
                        onMouseOver(scene.getObjectById(activeElement, true));
                    }

                    activeElement = elToMouseOver;
                } else {
                    //-- get the items that have been removed
                    if (activeElement) {
                        onMouseOut(scene.getObjectById(activeElement, true));
                        activeElement = false;
                    }
                }

                return hits;
            }

            function render() {
                if (debug) {
                    stats.begin();
                }
                camera.updateMatrixWorld();
                activeElements = getHoveredElements();
                renderHook();
                if (useVR) {
                    effect.render(scene, camera);
                } else {
                    renderer.render(scene, camera);
                }
                if (rendering) {
                    controls.update();
                    animationFrameRequest = requestAnimationFrame(render);
                }
                if (debug) {
                    stats.end();
                }
            }

            function destroy() {
                rendering = false;
                cancelAnimationFrame(animationFrameRequest);
                destroyAllSceneObjects();
                $(renderer.domElement).remove();
            }

            function destroyAllSceneObjects(skipTypes) {
                var i;
                skipTypes = (typeof skipTypes !== 'object') ? [] : skipTypes;
                i = scene.children.length;
                while (i--) {
                    var obj = scene.children[i];
                    // if our object is in the group of skip types, dont remove it
                    if (_.indexOf(skipTypes, obj.type) === -1) {
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
            }

            function stopRendering() {
                rendering = false;
                cancelAnimationFrame(animationFrameRequest);
            }

            function startRendering() {
                rendering = true;
                render();
            }

            function setCursorPosition(x, y) {
                mouse.x = (x / $$el.width()) * 2 - 1;
                mouse.y = - (y / $$el.height()) * 2 + 1;
            }

            function updateDimensions() {
                var width = $$el.width();
                var height = $$el.height();

                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                renderer.setSize(width, height);
            }

            function getScene() {
                return scene;
            }

            function getCamera() {
                return camera;
            }

            function getMouse() {
                return mouse;
            }

            function getActiveObject() {
                return scene.getObjectById(activeElement, true);
            }

            function addItem(item) {
                itemsMouseCanHit.push(item);
                item.isVisible = true;
                scene.add(item);
            }

            function pushItem(item) {
                itemsMouseCanHit.push(item);
                item.isVisible = true;
            }

            function setupBaseScene() {
                var ASPECT = $$el.width() / $$el.height();
                var FAR = 700;
                var FOV = 70;
                var NEAR = 0.001;

                if (debug) {
                    stats = new Stats();
                    stats.showPanel(0);
                }
                scene = new THREE.Scene();
                camera = new THREE.PerspectiveCamera(FOV, ASPECT, NEAR, FAR);
                scene.add(camera);
                renderer.setPixelRatio(window.devicePixelRatio);
                renderer.shadowMap.enabled = false;
                renderer.setSize($$el.width(), $$el.height());
                $$el.append(renderer.domElement);
                if (debug) {
                    $$el.append(stats.dom);
                }

                //camera.position.set(-90, 15, 0);
                camera.position.set(0, 10, 0);

                raycaster = new THREE.Raycaster();

                if (useVR) {
                    controls = new THREE.DeviceOrientationControls(camera, true);
                    controls.connect();
                    controls.update();
                    //TODO Replace this with WebVR + Shim
                    effect = new THREE.StereoEffect(renderer);
                } else {
                    controls = new THREE.OrbitControls(camera, renderer.domElement);
                    controls.target.set(
                      camera.position.x + 0.15,
                      camera.position.y,
                      camera.position.z
                    );
                    controls.minPolarAngle = Math.PI / 2 - 0.6;
                    controls.maxPolarAngle = Math.PI / 2 + 0.6;
                    controls.noPan = true;
                    controls.noZoom = true;
                }

                render();
            }

            function init($el, _renderer, _renderHook, _onMouseOver, _onMouseOut, _useVR) {
                $$el = $el;
                renderer = _renderer;
                if (typeof _renderHook === 'function') {
                    renderHook = _renderHook;
                }
                if (typeof _onMouseOut === 'function') {
                    onMouseOut = _onMouseOut;
                }
                if (typeof _onMouseOver === 'function') {
                    onMouseOver = _onMouseOver;
                }
                if (typeof _useVR === 'boolean') {
                    useVR = _useVR;
                }
                setupBaseScene();
            }

            return {
                activeObject: getActiveObject,
                addItem: addItem,
                camera: getCamera,
                destroy: destroy,
                destroyAllSceneObjects: destroyAllSceneObjects,
                init: init,
                mouse: getMouse,
                pushItem: pushItem,
                scene: getScene,
                setCursorPosition: setCursorPosition,
                startRendering: startRendering,
                stopRendering: stopRendering,
                resize: updateDimensions
            };
        };
    }
]);
