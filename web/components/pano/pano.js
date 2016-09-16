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
                    var geometry;
                    var material;
                    var i;
                    var floor;
                    var panels;
                    $$el.click(clickHandler);

                    scene.init($$el, $rootScope.renderer, onRender, mouseOverHandler, mouseOutHandler, useVr);
                    $rootScope.renderer.setClearColor(0x000000);
                    
                    i = $scope.panoContent.length;
                    panels = getPanels(i);
                    while (i--) {
                        var texture = THREE.ImageUtils.loadTexture($scope.panoContent[i].url);
                        material = new THREE.MeshBasicMaterial({side: THREE.DoubleSide, map: texture});
                        geometry = new THREE.PlaneBufferGeometry(70, 60);
                        floor = new THREE.Mesh(geometry, material);
                        floor.rotation.x = panels[i].rotation.x;
                        floor.rotation.y = panels[i].rotation.y;
                        floor.rotation.z = panels[i].rotation.z;

                        floor.position.x = panels[i].position.x;
                        floor.position.y = panels[i].position.y;
                        floor.position.z = panels[i].position.z;
                        scene.addItem(floor);
                    }
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
