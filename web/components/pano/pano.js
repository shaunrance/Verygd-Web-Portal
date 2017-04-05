/* global angular, THREE, $, TweenMax, _ */
angular.module('ua5App')
    .directive('pano', ['$rootScope', 'BaseThreeScene', 'BrowserFactory', 'GeoFactory', 'Hotspot', function($rootScope, BaseThreeScene, BrowserFactory, GeoFactory, Hotspot) {
        return {
            restrict: 'A',
            templateUrl: 'components/pano/pano.html',
            scope: {
                useVr: '=',
                panoContent: '=',
                background: '=',
                isPanorama: '=',
                sceneType: '=',
                equirectangularBackgroundImage: '=',
                hotspotType: '='
            },
            link: function($scope, element, attrs) {
                var $$el = $('.my-canvas');
                var $body = $('body');
                var crosshair;
                var scene = new BaseThreeScene();
                var useVr = $scope.useVr;
                var panelCount = 0;
                var exitBtn;
                var roomRadius;
                var worldDirectionVector = new THREE.Vector3();
                var cam;
                //var panoLink;
                var panoramaMesh;
                var background = $scope.background;
                var backgroundHex;

                if ($scope.sceneType === 'sphere') {
                    backgroundHex = 0x000000;
                    $scope.background = '#000000';
                } else {
                    backgroundHex = $scope.background !== '' ? $scope.background.split('#').join('') : 0x000000;
                    if ($scope.equirectangularBackgroundImage) {
                        makeSphere($scope.equirectangularBackgroundImage); //jshint ignore:line
                    }
                }

                if (typeof $scope.hotspotType === 'undefined') {
                    $scope.hotspotType = 'Minimal';
                }

                $scope.$watch(function() {
                    return $scope.useVr;
                }, function(newValue, oldValue) {
                    if (newValue !== oldValue) {
                        scene.destroy();
                        $$el.off();
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

                function componentToHex(c) {
                    var hex = c.toString(16);
                    return hex.length === 1 ? '0' + hex : hex;
                }

                function init() {
                    var i;
                    var panels;
                    var trueCount;
                    var pos = {x: 0, y: 0};
                    $$el.mousedown(function() {
                        pos = {x: cam.rotation.x, y: cam.rotation.y};
                    });

                    $$el.mouseup(function() {
                        if (
                            Math.abs(pos.x - cam.rotation.x) === 0 &&
                            Math.abs(pos.y - cam.rotation.y) === 0
                        ) {
                            setTimeout(function() {
                                clickHandler(scene.activeObject());
                            }, 100);
                        }
                    });

                    if ($scope.sceneType === 'sphere') {
                        backgroundHex = 0x000000;
                        $scope.background = '#000000';
                    } else {
                        backgroundHex = $scope.background !== '' ? $scope.background.split('#').join('') : 0x000000;
                        if ($scope.equirectangularBackgroundImage) {
                            makeSphere($scope.equirectangularBackgroundImage); //jshint ignore:line
                        }
                    }
                    scene.init($$el, $rootScope.renderer, onRender, mouseOverHandler, mouseOutHandler, useVr);

                    $rootScope.renderer.setClearColor(componentToHex($scope.background));
                    $rootScope.renderer.sortObjects = false;

                    trueCount = i = $scope.panoContent.length;

                    if (trueCount < 3) {
                        i = 4;
                    }
                    if (trueCount === 2) {
                        $scope.panoContent[2] = _.clone($scope.panoContent[1]);
                        $scope.panoContent[1] = undefined;
                    }

                    panels = getPanels(i);
                    panelCount = panels.length;

                    //legacy isPanorama support:
                    if (!$scope.sceneType) {
                        if ($scope.isPanorama) {
                            $scope.sceneType = 'cylinder';
                        } else {
                            $scope.sceneType = 'panel';
                        }
                    }

                    switch ($scope.sceneType) {
                        case 'cylinder':
                            makePanorama($scope.panoContent[0]);
                            break;
                        case 'sphere':
                            makeSphere($scope.panoContent[0]); //jshint ignore:line
                            break;
                        default:
                            while (i--) {
                                if ($scope.panoContent[i]) {
                                    makePanel($scope.panoContent[i], panels[i]);
                                }
                            }
                            break;
                    }

                    if (useVr) {
                        crosshair = makeCrosshair();
                    }

                    cam = scene.camera();
                    scene.setCursorPosition($(element).width() / 2, $(element).height() / 2);
                }

                function makePanel(data, panel) {
                    var geometry;
                    var material;
                    var plane;
                    var textureLoader = new THREE.TextureLoader();
                    var border;

                    textureLoader.crossOrigin = '';

                    if (!data) {
                        return;
                    }

                    border = (!data.related_tag) ? '' : '&border=2,81e4ee';

                    textureLoader.load(
                        data.url,
                        function(texture) {
                            var size = sizePlaneFromImage(texture.image);

                            material = new THREE.MeshBasicMaterial({
                                side: THREE.MeshBasicMaterial,
                                transparent: true,
                                map: texture,
                                opacity: 1,
                                alphaTest: 0.1
                            });

                            geometry = new THREE.PlaneBufferGeometry(size.width, size.height);
                            plane = new THREE.Mesh(geometry, material);
                            plane.name = 'panel';
                            plane.rotation.x = panel.rotation.x;
                            plane.rotation.y = panel.rotation.y;
                            plane.rotation.z = panel.rotation.z;

                            plane.position.x = panel.position.x;
                            plane.position.y = panel.position.y;
                            plane.position.z = panel.position.z;
                            plane.index = panel.index;

                            scene.addItem(plane);
                            makeHotspots(data.hotspots, plane, size.width, size.height);
                        }
                    );
                }

                function makeHotspots(data, container, width, height, radius) {
                    container.hotspots = [];
                    if ($scope.hotspotType === 'Disabled') {
                        return;
                    }
                    _.each(data, function(item) {
                        var hotspot = new Hotspot({
                            data: item,
                            scene: scene,
                            hotspotType: $scope.hotspotType,
                            stereoscopic: $scope.useVr,
                            container: container,
                            planeWidth: width,
                            planeHeight: height,
                            radius: radius || null,
                            sceneType: $scope.sceneType
                        });
                        container.add(hotspot);
                        container.hotspots.push(hotspot);
                        scene.pushItem(hotspot);
                    });
                }

                function makePanorama(data) {
                    var geometry;
                    var material;
                    var textureLoader = new THREE.TextureLoader();

                    textureLoader.crossOrigin = '';
                    textureLoader.load(
                        data.url,
                        function(texture) {
                            var height;

                            material = new THREE.MeshBasicMaterial({
                                side: THREE.FrontSide,
                                transparent: true,
                                map: texture,
                                opacity: 1,
                                alphaTest: 0.1
                            });

                            function map(value, start1, stop1, start2, stop2) {
                                return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
                            }

                            height = map(texture.image.width / texture.image.height, 7.5, 2.01, 40, 300);

                            geometry = new THREE.CylinderGeometry(150, 150, height, 20, 1, true);

                            geometry.elementsNeedUpdate = true; // update faces

                            panoramaMesh = new THREE.Mesh(geometry, material);
                            panoramaMesh.index = 0;
                            panoramaMesh.name = 'panorama';

                            panoramaMesh.rotation.y = 4.723;
                            panoramaMesh.position.y = 8;

                            //invert the object, to fix the texture
                            panoramaMesh.scale.set(- 1, 1, 1);
                            scene.addItem(panoramaMesh, true);
                            makeHotspots(data.hotspots, panoramaMesh, 0, height);
                            //makePanoramaHotspots(data.hotspots, height, panoramaMesh);
                        }
                    );
                }

                function makeSphere(data) { //jshint ignore:line
                    var url = (typeof data === 'string') ? data : data.url;
                    var radius = 500;
                    var sphere;
                    var textureLoader = new THREE.TextureLoader();

                    textureLoader.crossOrigin = '';
                    textureLoader.load(
                        url,
                        function(texture) {
                            var threeWidth;
                            if (typeof data === 'object') {
                                threeWidth = Math.pow(2, Math.round(Math.log(texture.image.width) / Math.log(2)));
                                radius = threeWidth / 2 / Math.PI;
                            }
                            var geometry = new THREE.SphereGeometry(radius, 32, 32);
                            var material = new THREE.MeshBasicMaterial({
                                transparent: true,
                                map: texture,
                                opacity: 1,
                                side: THREE.DoubleSide
                            });
                            sphere = new THREE.Mesh(geometry, material);

                            sphere.scale.set(-0.9, 0.9, 0.9);
                            if (!BrowserFactory.isMobile()) {
                                sphere.rotation.y = Math.PI;
                            } else {
                                sphere.rotation.y = Math.PI / -2;
                            }
                            scene.scene().add(sphere);
                            if (typeof data === 'object') {
                                makeHotspots(data.hotspots, sphere, texture.image.width, texture.image.height, radius);
                            }
                        }
                    );
                }

                // function createExitBtn() {
                //     var geometry = new THREE.PlaneGeometry(40, 20, 1);
                //     var material;
                //     var textureLoader = new THREE.TextureLoader();
                //     textureLoader.load(
                //         '/assets/img/exit.png',
                //         function(texture) {
                //             material = new THREE.MeshBasicMaterial({
                //                 side: THREE.MeshBasicMaterial,
                //                 transparent: true,
                //                 map: texture,
                //                 opacity: 0.8
                //             });
                //             exitBtn = new THREE.Mesh(geometry, material);
                //             exitBtn.name = 'exit';
                //             if (useVr) {
                //                 scene.addItem(exitBtn);
                //             }
                //             if (typeof panoLink === 'object') {
                //                 exitBtn.add(panoLink);
                //             }
                //         }
                //     );
                // }

                function reload() {
                    var i;
                    var trueCount;
                    var panels;
                    // empty the scene, except for our camera:
                    scene.destroyAllSceneObjects(['PerspectiveCamera']);
                    // make new panels
                    panels = getPanels(i);
                    panelCount = panels.length;
                    background = $scope.background;
                    if ($scope.sceneType === 'sphere') {
                        backgroundHex = 0x000000;
                        $scope.background = '#000000';
                    } else {
                        backgroundHex = $scope.background !== '' ? $scope.background.split('#').join('') : 0x000000;
                        if ($scope.equirectangularBackgroundImage) {
                            makeSphere($scope.equirectangularBackgroundImage);
                        }
                    }
                    $rootScope.renderer.setClearColor(componentToHex(background));
                    $rootScope.renderer.autoClear = false;
                    $rootScope.renderer.sortObjects = false;
                    trueCount = i = $scope.panoContent.length;

                    if (trueCount < 3) {
                        i = 4;
                    }
                    if (trueCount === 2) {
                        $scope.panoContent[2] = _.clone($scope.panoContent[1]);
                        $scope.panoContent[1] = undefined;
                    }

                    panels = getPanels(i);
                    panelCount = panels.length;

                    if (!$scope.sceneType) {
                        if ($scope.isPanorama) {
                            $scope.sceneType = 'cylinder';
                        } else {
                            $scope.sceneType = 'panel';
                        }
                    }

                    switch ($scope.sceneType) {
                        case 'cylinder':
                            makePanorama($scope.panoContent[0]);
                            break;
                        case 'sphere':
                            makeSphere($scope.panoContent[0]);
                            break;
                        default:
                            while (i--) {
                                if ($scope.panoContent[i]) {
                                    makePanel($scope.panoContent[i], panels[i]);
                                }
                            }
                            break;
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
                        exitBtn.position.y = -200;
                        exitBtn.lookAt(cam.position);
                    }
                }

                function toggleHotspots(activeObject) {

                    //if we're on a cylinder or sphere scene
                    if (
                        (
                            $scope.sceneType === 'cylinder' ||
                            $scope.sceneType === 'sphere'
                        ) &&
                        // and we click nothing
                        typeof activeObject !== 'object'
                    ) {
                        //set it to the panorama mesh, so we can flash the hotspots
                        activeObject = panoramaMesh;
                    }

                    if (typeof activeObject === 'object') {
                        var clickedHotspot = false;

                        if (activeObject.name === 'hotspot') {
                            launchHotpsot(activeObject.hotspot);
                            clickedHotspot = true;
                        }

                        //todo
                        if (!clickedHotspot && $scope.hotspotType !== 'visible') {
                            if (activeObject.name === 'panel' || activeObject.name === 'panorama') {
                                _.each(activeObject.hotspots, function(child) {
                                    if (child.name === 'hotspot') {
                                        child.flash();
                                    }
                                });
                            }
                        }
                    }
                }

                function clickHandler(item) {
                    toggleHotspots(item);

                    if (typeof item !== 'undefined') {
                        if (item.name === 'exit') {
                            TweenMax.to(item.material, 0.2, {opacity: 0.2});
                            TweenMax.to(item.material, 0.2, {opacity: 1, delay: 0.2, onComplete: function() {
                                window.history.back();
                            }});
                        }
                    }
                }

                function launchHotpsot(data) {
                    $body.removeClass('body--hotspot-hovered');
                    if (data.type === 'scene') {
                        $rootScope.$broadcast('scene:change', {link: data.sceneId});
                    } else if (data.type === 'url') {
                        if (!data.newWindow) {
                            window.location = data.url;
                        } else {
                            window.open(data.url, '_blank');
                        }
                    }
                }

                function mouseOverHandler(item) {
                    //console.log('Mouse Hovering: ', item);
                    // if (!gazeStarted && useVr) {
                    //     // Animate crosshair for long gaze
                    //     gazeStarted = true;
                    //     TweenMax.to(crosshair.scale, 2, {x: 0.1, y: 0.1, ease:Linear.easeNone});
                    //     TweenMax.to(crosshair.material, 0.2, {opacity: 0.4, ease:Linear.easeNone});
                    //     clearTimeout(gazeTimeout);
                    //     gazeTimeout = setTimeout(clickHandler, 1700);
                    // }
                    if (item && item.name === 'hotspot') {
                        $body.addClass('body--hotspot-hovered');
                    }
                }

                function mouseOutHandler(item) {
                    // if (useVr) {
                    //     // Reset crosshair for long gaze
                    //     gazeStarted = false;
                    //     clearTimeout(gazeTimeout);
                    //     TweenMax.to(crosshair.scale, 0.3, {x: 1, y: 1});
                    //     TweenMax.to(crosshair.material, 0.3, {opacity: 0, ease:Linear.easeNone});
                    // }
                    $body.removeClass('body--hotspot-hovered');
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
                scene.resize();

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
