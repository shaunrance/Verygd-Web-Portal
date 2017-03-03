/* global angular, THREE, $, TweenMax, _ */
angular.module('ua5App')
    .directive('pano', ['$rootScope', 'BaseThreeScene', 'BrowserFactory', 'GeoFactory', function($rootScope, BaseThreeScene, BrowserFactory, GeoFactory) {
        return {
            restrict: 'A',
            templateUrl: 'components/pano/pano.html',
            scope: {
                useVr: '=',
                panoContent: '=',
                background: '=',
                isPanorama: '=',
                sceneType: '=',
                hotspotType: '@'
            },
            link: function($scope, element, attrs) {
                var $$el = $('.my-canvas');
                var crosshair;
                var scene = new BaseThreeScene();
                var useVr = $scope.useVr;
                var panelCount = 0;
                var exitBtn;
                var roomRadius;
                var worldDirectionVector = new THREE.Vector3();
                var cam;
                var panoLink;
                var panoramaMesh;
                var background = $scope.background;
                var backgroundHex = $scope.background !== '' ? $scope.background.split('#').join('') : 0x000000;

                if (typeof $scope.hotspotType === 'undefined') {
                    $scope.hotspotType = 'hidden';
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
                            setTimeout(clickHandler, 100);
                        }
                    });

                    scene.init($$el, $rootScope.renderer, onRender, mouseOverHandler, mouseOutHandler, useVr);

                    $rootScope.renderer.setClearColor(componentToHex(background));
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

                    if (!$scope.isPanorama) {
                        createExitBtn();
                    } else {
                        makePanorama($scope.panoContent[0]);
                    }
                    switch ($scope.sceneType) {
                        case 'panorama':
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
                        data.url + '?fm=jpg&bg=' + backgroundHex + border,
                        function(texture) {
                            var size = sizePlaneFromImage(texture.image);

                            material = new THREE.MeshBasicMaterial({
                                side: THREE.MeshBasicMaterial,
                                transparent: true,
                                map: texture,
                                opacity: 1
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

                function makeHotspots(data, container, width, height) {
                    container.hotspots = [];
                    _.each(data, function(item) {
                        var spotWidth = GeoFactory.map(item.width, 0, 1, 0, width);
                        var spotHeight = GeoFactory.map(item.height, 0, 1, 0, height);
                        var geometry = new THREE.PlaneGeometry(spotWidth, spotHeight, 32);
                        var material = new THREE.MeshBasicMaterial({
                            color: 0x81e4ee,
                            side: THREE.DoubleSide,
                            transparent: true,
                            opacity: 0.0
                        });
                        var plane = new THREE.Mesh(geometry, material);
                        plane.position.z = 1;
                        plane.position.x = GeoFactory.map(item.x, 0, 1, - width / 2, width / 2);
                        plane.position.y = GeoFactory.map(item.y, 0, 1, height / 2, - height / 2);
                        plane.position.x += spotWidth / 2;
                        plane.position.y -= spotHeight / 2;
                        //account for z of 1 offset:
                        plane.scale.x = 0.95;
                        plane.scale.y = 0.95;
                        plane.name = 'hotspot';
                        plane.hotspot = item;
                        plane.showing = false;
                        plane.show = function() {
                            plane.showing = true;
                            plane.isVisible = true;
                            TweenMax.to(material, 0.25, {opacity: 0.3});
                        };
                        plane.hide = function() {
                            plane.showing = false;
                            plane.isVisible = false;
                            TweenMax.to(material, 0.25, {opacity: 0});
                        };
                        scene.pushItem(plane);
                        plane.isVisible = false;
                        container.add(plane);
                        container.hotspots.push(plane);

                        if ($scope.hotspotType === 'visible') {
                            plane.show();
                        }
                    });
                }

                function makePanorama(data) {
                    var geometry;
                    var material;
                    var textureLoader = new THREE.TextureLoader();

                    textureLoader.crossOrigin = '';
                    textureLoader.load(
                        data.url + '?fm=jpg',
                        function(texture) {
                            var height;

                            material = new THREE.MeshBasicMaterial({
                                side: THREE.FrontSide,
                                transparent: true,
                                map: texture,
                                opacity: 1
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
                            makePanoramaHotspots(data.hotspots, height, panoramaMesh);
                        }
                    );
                }

                function makePanoramaHotspots(data, height, parent) {
                    parent.hotspots = [];
                    _.each(data, function(item, index) {
                        var hotspotGeo;
                        var hotspotMat;
                        var hotspotMesh;
                        var degreesPos = item.x * 360.0;
                        var radiansPos = degreesPos * (Math.PI / 180);
                        var degreesWidth = item.width * 360.0;
                        var radiansWidth = degreesWidth * (Math.PI / 180);
                        var spotWidth = radiansWidth;
                        var spotPos = radiansPos;
                        var spotHeight = GeoFactory.map(item.height, 0, 1, 0, height);
                        var spotY = GeoFactory.map(item.y, 0, 1, height / 2, - height / 2);

                        spotPos = (2 * Math.PI) - spotPos - spotWidth;

                        hotspotGeo = new THREE.CylinderGeometry(150, 150, spotHeight, 20, 1, true, spotPos, spotWidth);
                        hotspotMat = new THREE.MeshBasicMaterial({color: 0x81e4ee, side: THREE.DoubleSide, opacity: 0, transparent: true});
                        hotspotMesh = new THREE.Mesh(hotspotGeo, hotspotMat);
                        hotspotMesh.scale.set(0.9, 0.9, 0.9);
                        hotspotMesh.position.y = spotY - (spotHeight / 2);
                        hotspotGeo.theaLength = spotWidth;
                        hotspotMesh.name = 'hotspot';
                        hotspotMesh.hotspot = item;
                        hotspotMesh.showing = false;
                        hotspotMesh.rotation.y = 4.723;
                        hotspotMesh.show = function() {
                            hotspotMesh.showing = true;
                            hotspotMesh.isVisible = true;
                            TweenMax.to(hotspotMat, 0.25, {opacity: 0.3});
                        };
                        hotspotMesh.hide = function() {
                            hotspotMesh.showing = false;
                            hotspotMesh.isVisible = false;
                            TweenMax.to(hotspotMat, 0.25, {opacity: 0});
                        };
                        scene.pushItem(hotspotMesh);
                        hotspotMesh.isVisible = false;
                        scene.addItem(hotspotMesh, true);
                        parent.hotspots.push(hotspotMesh);

                        if ($scope.hotspotType === 'visible') {
                            hotspotMesh.show();
                        }
                    });
                }

                function makeSphere(item) {
                    var sphere;
                    var textureLoader = new THREE.TextureLoader();

                    textureLoader.crossOrigin = '';
                    textureLoader.load(
                        item.url,
                        function(texture) {
                            var geometry = new THREE.SphereGeometry(500, 32, 32);
                            var material = new THREE.MeshBasicMaterial({
                                transparent: true,
                                map: texture,
                                opacity: 1,
                                side: THREE.DoubleSide
                            });
                            sphere = new THREE.Mesh(geometry, material);

                            sphere.scale.set(-0.9, 0.9, 0.9);
                            scene.addItem(sphere);
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
                            material = new THREE.MeshBasicMaterial({
                                side: THREE.MeshBasicMaterial,
                                transparent: true,
                                map: texture,
                                opacity: 0.8
                            });
                            exitBtn = new THREE.Mesh(geometry, material);
                            exitBtn.name = 'exit';
                            if (useVr) {
                                scene.addItem(exitBtn);
                            }
                            if (typeof panoLink === 'object') {
                                exitBtn.add(panoLink);
                            }
                        }
                    );
                }

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
                    backgroundHex = $scope.background !== '' ? $scope.background.split('#').join('') : 0x000000;
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

                    if (!$scope.isPanorama) {
                        while (i--) {
                            makePanel($scope.panoContent[i], panels[i]);
                        }
                    } else {
                        makePanorama($scope.panoContent[0]);
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

                function toggleHotspots(activeObjects) {
                    if (typeof activeObjects === 'object' && activeObjects.length > 0) {
                        var clickedHotspot = false;
                        _.each(activeObjects, function(obj) {
                            if (obj.name === 'hotspot') {
                                launchHotpsot(obj.hotspot);
                                clickedHotspot = true;
                            }
                        });

                        if (!clickedHotspot && $scope.hotspotType !== 'visible') {
                            _.each(activeObjects, function(obj) {
                                if (obj.name === 'panel' || obj.name === 'panorama') {
                                    _.each(obj.hotspots, function(child) {
                                        if (child.name === 'hotspot') {
                                            if (child.showing) {
                                                child.hide();
                                            } else {
                                                child.show();
                                            }
                                        }
                                    });
                                }
                            });
                        }
                    }
                }

                function clickHandler(item) {
                    var activeObjects = scene.activeObjects();

                    // Clicking the entire scene fires the panorama click
                    // there's no click listener on the actual cyl. geometry
                    if (activeObjects.length === 0 && $scope.isPanorama && typeof panoramaMesh === 'object') {
                        activeObjects = [panoramaMesh];
                    }

                    toggleHotspots(activeObjects);

                    if (typeof scene.activeObject() !== 'undefined') {
                        if (scene.activeObject().name === 'exit') {
                            TweenMax.to(scene.activeObject().material, 0.2, {opacity: 0.2});
                            TweenMax.to(scene.activeObject().material, 0.2, {opacity: 1, delay: 0.2, onComplete: function() {
                                window.history.back();
                            }});
                        }
                    }
                }

                function launchHotpsot(data) {
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
                }

                function mouseOutHandler(item) {
                    // if (useVr) {
                    //     // Reset crosshair for long gaze
                    //     gazeStarted = false;
                    //     clearTimeout(gazeTimeout);
                    //     TweenMax.to(crosshair.scale, 0.3, {x: 1, y: 1});
                    //     TweenMax.to(crosshair.material, 0.3, {opacity: 0, ease:Linear.easeNone});
                    // }
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
