/* global angular, THREE, $, TweenMax, Linear */
angular.module('ua5App')
    .directive('pano', ['$rootScope', 'BaseThreeScene', 'BrowserFactory', function($rootScope, BaseThreeScene, BrowserFactory) {
        return {
            restrict: 'A',
            templateUrl: 'components/pano/pano.html',
            scope: {
                useVr: '=',
                panoContent: '='
            },
            link: function($scope, element, attrs) {
                var $$el = $('.my-canvas');
                var crosshair;
                var gazeStarted = false;
                var gazeTimeout;
                var scene = new BaseThreeScene();
                var useVr = $scope.useVr;
                var panelCount = 0;
                var exitBtn;
                var roomRadius;
                var worldDirectionVector = new THREE.Vector3();
                var cam;

                $scope.$watch(function() {
                    return $scope.useVr;
                }, function(newValue, oldValue) {
                    if (newValue !== oldValue) {
                        scene.destroy();
                        useVr = newValue;
                        scene = new BaseThreeScene();
                        init();
                        scene.resize();
                    }
                });

                // Watch for new data getting set (aka a new scene);
                $scope.$watchCollection(function() {
                    return $scope.panoContent;
                }, function(newValue, oldValue) {
                    if (newValue !== oldValue) {
                        $scope.panoContent = newValue;
                        reload();
                    }
                });

                // returns an array of panels positioned equally around a room
                function getPanels(numSides) {
                    //75 is a good radius for 6 sides, this adjusts accordingly:
                    var radius = (75 * numSides) / 6,
                        yRot = Math.PI / -2;

                    var angle = 2 * Math.PI / numSides; // arbitrary

                    var panels = [];

                    var rotation,
                        position;

                    roomRadius = radius;

                    for (var i = 0; i < numSides; i++) {
                        rotation = {
                            x: 0,
                            y: -angle * i + yRot,
                            z: 0
                        };

                        position = {
                            x: parseFloat((radius * Math.cos(angle * i)).toFixed(3)),
                            y: (useVr) ? 15 : 10,
                            z: parseFloat((radius * Math.sin(angle * i)).toFixed(3))
                        };

                        panels.push({rotation: rotation, position: position, file: 1, index: i});
                    }
                    return panels;
                }

                function init() {
                    var i;
                    var panels;
                    var pos = {x: 0, y: 0};
                    
                    $$el.mousedown(function() {
                        pos = {x: cam.rotation.x, y: cam.rotation.y};
                    });
                    $$el.mouseup(function() {
                        if (
                            Math.abs(pos.x - cam.rotation.x) === 0 &&
                            Math.abs(pos.y - cam.rotation.y) === 0
                        ) {
                            clickHandler();
                        }
                    });

                    scene.init($$el, $rootScope.renderer, onRender, mouseOverHandler, mouseOutHandler, useVr);
                    $rootScope.renderer.setClearColor(0x000000);
                    
                    i = $scope.panoContent.length;
                    panels = getPanels(i);
                    panelCount = panels.length;
                    while (i--) {
                        makePanel($scope.panoContent[i], panels[i]);
                    }

                    if (useVr) {
                        crosshair = makeCrosshair();    
                    }
                    cam = scene.camera();
                    scene.setCursorPosition($(element).width() / 2, $(element).height() / 2);
                    createExitBtn();
                }

                function makePanel(data, panel) {
                    var geometry;
                    var hitAreaGeo;
                    var hitAreaMat;
                    var hitAreaMesh;
                    var material;
                    var plane;
                    var textureLoader = new THREE.TextureLoader();

                    textureLoader.load(
                        data.url + '?fm=jpg&h=800&w=800&fit=max&q=60',
                        function(texture) {
                            var size = sizePlaneFromImage(texture.image);
                            var linkMaterial;

                            material = new THREE.MeshBasicMaterial({
                                side: THREE.MeshBasicMaterial,
                                transparent: true,
                                map: texture,
                                opacity: 1
                            });

                            geometry = new THREE.PlaneBufferGeometry(size.width, size.height);
                            plane = new THREE.Mesh(geometry, material);
                            plane.rotation.x = panel.rotation.x;
                            plane.rotation.y = panel.rotation.y;
                            plane.rotation.z = panel.rotation.z;

                            plane.position.x = panel.position.x;
                            plane.position.y = panel.position.y;
                            plane.position.z = panel.position.z;
                            plane.index = panel.index;

                            if (useVr) {
                                linkMaterial = new THREE.MeshBasicMaterial({
                                    side: THREE.MeshBasicMaterial,
                                    map: THREE.ImageUtils.loadTexture('/assets/img/link.png'),
                                    transparent: true
                                });

                                hitAreaGeo = new THREE.CircleGeometry(2, 32);
                                hitAreaMat = linkMaterial;
                                hitAreaMat.depthWrite = false;
                                hitAreaMesh = new THREE.Mesh(hitAreaGeo, hitAreaMat);
                                hitAreaMesh.name = 'sceneLink';
                                hitAreaMesh.position.y = -size.height / 2 - 4;
                                hitAreaMesh.position.z = 3;
                                plane.add(hitAreaMesh);
                                scene.pushItem(hitAreaMesh); 
                                scene.scene().add(plane);
                            } else {
                                plane.name = 'sceneLink';
                                scene.addItem(plane);
                            }
                            
                        }
                    );
                }

                function createExitBtn() {
                    var geometry = new THREE.PlaneGeometry(40, 20, 1);
                    var material;
                    var textureLoader = new THREE.TextureLoader();
                    textureLoader.load(
                        '/assets/img/exit.png',
                        function(texture) {
                            var plane;
                            material = new THREE.MeshBasicMaterial({
                                side: THREE.MeshBasicMaterial,
                                transparent: true,
                                map: texture,
                                opacity: 0.8
                            });
                            plane = new THREE.Mesh(geometry, material);
                            plane.name = 'exit';
                            if (useVr) {
                                scene.addItem(plane);
                            }
                            exitBtn = plane;
                        }
                    );
                }

                function reload() {
                    var i = $scope.panoContent.length;
                    var panels;
                    // empty the scene, except for our camera:
                    scene.destroyAllSceneObjects(['PerspectiveCamera']);
                    // make new panels
                    panels = getPanels(i);
                    while (i--) {
                        makePanel($scope.panoContent[i], panels[i]);
                    }
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
                    var cam = scene.camera();

                    backGeo = new THREE.SphereGeometry(0.2, 25, 25);
                    backMat = new THREE.MeshBasicMaterial({color: 0xffffff, opacity: 0.3, transparent: true});
                    backMesh = new THREE.Mesh(backGeo, backMat);
                    backMat.depthWrite = false;
                    backMesh.position.set(0, 0, -5);

                    midGeo = new THREE.SphereGeometry(0.2, 25, 25);
                    midMat = new THREE.MeshBasicMaterial({color: 0xffffff, opacity: 0.0, transparent: true});
                    midMesh = new THREE.Mesh(midGeo, midMat);
                    midMat.depthWrite = false;
                    midMesh.position.set(0, 0, -5); 

                    frontGeo = new THREE.SphereGeometry(0.04, 25, 25);
                    frontMat = new THREE.MeshBasicMaterial({color: 0xffffff, opacity: 0.9, transparent: true});
                    frontMat.depthWrite = false;
                    frontMesh = new THREE.Mesh(frontGeo, frontMat);
                    frontMesh.position.set(0, 0, -5);
                    
                    //add in in front of our camera:
                    cam.add(backMesh);
                    cam.add(midMesh);
                    cam.add(frontMesh);

                    // return the mid crosshair, so we can animate it
                    return midMesh;
                }

                // returns a width & height object
                // it keeps the aspect of the uploaded image
                function sizePlaneFromImage(image) {
                    var MAX_H = 60;
                    var MAX_W = 70;
                    var dimensions = {};

                    if (image.height > image.width) {
                        dimensions.height = MAX_H;
                        dimensions.width = (MAX_H * image.width) / image.height;
                    } else if (image.height < image.width) {
                        dimensions.width = MAX_W;
                        dimensions.height = (MAX_W * image.height) / image.width;
                    } else {
                        dimensions = {width: MAX_H, height: MAX_H};
                    }
                    return dimensions;
                }
                
                function onRender() {
                    if (typeof exitBtn === 'object' && useVr) {
                        cam.getWorldDirection(worldDirectionVector);
                        exitBtn.position.z = worldDirectionVector.z * 200;
                        exitBtn.position.x = worldDirectionVector.x * 200;
                        exitBtn.position.y = -145;
                        exitBtn.lookAt(cam.position);
                    }
                }

                function clickHandler(item) {
                    console.log('Clicked: ', scene.activeObject());
                    if (typeof scene.activeObject() !== 'undefined') {
                        if (scene.activeObject().name === 'sceneLink') {
                            // TODO: hook this up with real data
                            // currently hardcoded to fire a 'scene:change' event
                            TweenMax.to(scene.activeObject().material, 0.2, {opacity: 0.2});
                            TweenMax.to(scene.activeObject().material, 0.2, {opacity: 0.5, delay: 0.2, onComplete: function() {
                                $rootScope.$broadcast('scene:change');
                            }});                            
                        } else if (scene.activeObject().name === 'exit') {
                            TweenMax.to(scene.activeObject().material, 0.2, {opacity: 0.2});
                            TweenMax.to(scene.activeObject().material, 0.2, {opacity: 0.5, delay: 0.2, onComplete: function() {
                                window.history.back();
                            }});                            
                        }
                    }
                }

                function mouseOverHandler(item) {
                    //console.log('Mouse Hovering: ', item);
                    if (!gazeStarted && useVr) {
                        // Animate crosshair for long gaze
                        gazeStarted = true;
                        TweenMax.to(crosshair.scale, 2, {x: 0.1, y: 0.1, ease:Linear.easeNone});
                        TweenMax.to(crosshair.material, 0.2, {opacity: 0.4, ease:Linear.easeNone});
                        clearTimeout(gazeTimeout);
                        gazeTimeout = setTimeout(clickHandler, 1700);
                    }
                }

                function mouseOutHandler(item) {
                    if (useVr) {
                        // Reset crosshair for long gaze
                        gazeStarted = false;
                        clearTimeout(gazeTimeout);
                        TweenMax.to(crosshair.scale, 0.3, {x: 1, y: 1});
                        TweenMax.to(crosshair.material, 0.3, {opacity: 0, ease:Linear.easeNone});                        
                    }
                }
                                
                $rootScope.$on('app:resized', function() {
                    $$el.width($(window).width());
                    $$el.height($(window).height());
                    scene.resize();
                });

                $scope.$on('$destroy', function() {
                    scene.destroy();
                });

                $$el.mousemove(function(event) {
                    if (!useVr) {
                        scene.setCursorPosition(
                            event.clientX - $$el.offset().left + $(window).scrollLeft(),
                            event.clientY - $$el.offset().top + $(window).scrollTop()
                        );
                    }
                });
                
                init();

                // TODO: Add touch
                // $element.on('touchmove touchstart', function(event) {
                //     var mouseX = event.originalEvent.touches[0].pageX - $element.offset().left + $window.scrollLeft();
                //     var mouseY = event.originalEvent.touches[0].pageY - $element.offset().top + $window.scrollTop();
                //     map.setTouching(true);
                //     map.setCursorPosition(mouseX, mouseY);
                // });               
            }
        };
    }])
;
