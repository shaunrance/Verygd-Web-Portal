/* global angular, THREE, $ */
angular.module('ua5App')
    .directive('pano', ['$rootScope', 'BaseThreeScene', function($rootScope, BaseThreeScene) {
        return {
            restrict: 'A',
            templateUrl: 'components/pano/pano.html',
            link: function($scope, element, attrs) {
                var scene = new BaseThreeScene();
                var sphere;
                var $$el = $('.my-canvas');
                var panels = [
                    {
                        rotation: {
                            x: 0,
                            y: -Math.PI / 2,
                            z: 0
                        },
                        position: {
                            x: 45,
                            y: 15,
                            z: 0
                        }
                    },
                    {
                        rotation: {
                            x: 0,
                            y: -Math.PI / 2,
                            z: 0
                        },
                        position: {
                            x: -50,
                            y: 15,
                            z: 0
                        }
                    },
                    {
                        rotation: {
                            x: 0,
                            y: 60,
                            z: 0
                        },
                        position: {
                            x: 0,
                            y: 15,
                            z: 55
                        }
                    },
                    {
                        rotation: {
                            x: 0,
                            y: 60,
                            z: 0
                        },
                        position: {
                            x: 0,
                            y: 15,
                            z: -55
                        }
                    }
                ];

                function init() {
                    var geometry;
                    var material;
                    var i;
                    var floor;
                    $$el.click(clickHandler);
                    scene.init($$el, $rootScope.renderer, onRender, mouseOverHandler, mouseOutHandler);
                    $rootScope.renderer.setClearColor(0x000000);
                    geometry = new THREE.SphereGeometry(1, 1, 1);
                    material = new THREE.MeshBasicMaterial({color: 0xff0000});

                    i = panels.length;
                    while (i--) {
                        material = new THREE.MeshBasicMaterial({color: 0x00ff00, side: THREE.DoubleSide});
                        geometry = new THREE.PlaneBufferGeometry(60, 30);
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
                    sphere.rotation.x += 0.01;
                    sphere.rotation.y += 0.01;
                    sphere.rotation.z += 0.01;
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

            }
        };
    }])
;
