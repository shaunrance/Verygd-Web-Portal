/* global angular, THREE, $ */
angular.module('ua5App')
    .directive('pano', ['$rootScope', 'BaseThreeScene', function($rootScope, BaseThreeScene) {
        return {
            restrict: 'A',
            templateUrl: 'components/pano/pano.html',
            scope: {
                useVr: '=',
                panoContent: '='
            },
            link: function($scope, element, attrs) {
                var scene = new BaseThreeScene();
                var $$el = $('.my-canvas');
                var useVr = $scope.useVr;

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

                function getPanels(numSides) {
                    var radius = (75 * numSides) / 6, // arbitrary
                        yRot = Math.PI / -2;

                    var angle = 2 * Math.PI / numSides; // arbitrary

                    var panels = [];

                    var rotation,
                        position;

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

                        panels.push({rotation: rotation, position: position, file: 1});
                    }
                    return panels;
                }

                function init() {
                    var i;
                    var panels;
                    $$el.click(clickHandler);

                    scene.init($$el, $rootScope.renderer, onRender, mouseOverHandler, mouseOutHandler, useVr);
                    $rootScope.renderer.setClearColor(0x000000);
                    
                    i = $scope.panoContent.length;
                    panels = getPanels(i);
                    while (i--) {
                        makePanel($scope.panoContent[i], panels[i]);
                    }
                }

                function makePanel(data, panel) {
                    var floor;
                    var geometry;
                    var material;
                    var textureLoader = new THREE.TextureLoader();

                    textureLoader.load(
                        data.url + '?fm=jpg&h=800&w=800&fit=max&q=60',
                        function(texture) {
                            var size = getPlaneSize(texture.image);
                            texture.repeat.x = 1; // adjust as needed to stretch horizontally
                            texture.repeat.y = 1; // adjust as needed to stretch vertically

                            material = new THREE.MeshBasicMaterial({
                                side: THREE.MeshBasicMaterial,
                                map: texture
                            });
                            geometry = new THREE.PlaneBufferGeometry(size.width, size.height);
                            floor = new THREE.Mesh(geometry, material);
                            floor.rotation.x = panel.rotation.x;
                            floor.rotation.y = panel.rotation.y;
                            floor.rotation.z = panel.rotation.z;

                            floor.position.x = panel.position.x;
                            floor.position.y = panel.position.y;
                            floor.position.z = panel.position.z;
                            scene.addItem(floor);
                        }
                    );
                }

                function getPlaneSize(image) {
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
                }

                function clickHandler(item) {
                    console.log('Clicked: ', scene.activeObject());
                }

                function mouseOverHandler(item) {
                    // console.log('Mouse Hovering: ', item);
                }

                function mouseOutHandler(item) {
                    // console.log('Mouse Out: ', item);
                }
                init();

                $rootScope.$on('app:resized', function() {
                    $$el.width($(window).width());
                    $$el.height($(window).height());
                    scene.resize();
                });

                $scope.$on('$destroy', function() {
                    scene.destroy();
                });
            }
        };
    }])
;
