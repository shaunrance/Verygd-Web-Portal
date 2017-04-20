/* global angular, THREE, window, _, $, Stats */
angular.module('suite').factory('Hotspot', ['$rootScope', 'BrowserFactory', 'GeoFactory',
    function($rootScope, BrowserFactory, GeoFactory) {
        return function(config) {
            var defaults = {
                data: null,
                scene: null,
                sceneType: 'panel',
                hotspotType: 'Minimal',
                stereoscopic: false,
                container: null,
                planeWidth: 0,
                planeHeight: 0
            };
            var mesh;
            var material = new THREE.MeshBasicMaterial({
                color: 0x81e4ee,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.0
            });

            var show = function () {
                mesh.showing = true;
                TweenMax.to(material, 0.25, {opacity: 0.3});
            };

            var hide = function() {
                mesh.showing = false;
                TweenMax.to(material, 0.25, {opacity: 0});
            };

            var flash = function() {
                if (
                    config.hotspotType === 'Visible Rectangles'
                ) {
                    return;
                }

                show();
                TweenMax.delayedCall(0.5, hide);
            }

            function makePoint() {
                var pointGeometry;
                var pointMaterial;
                var circle;
                var textureLoader = new THREE.TextureLoader();

                textureLoader.crossOrigin = '';
                textureLoader.load(
                    '/assets/img/point.png',
                    function(texture) {
                        pointGeometry = new THREE.CircleGeometry(1, 32);
                        pointMaterial = new THREE.MeshBasicMaterial({
                            side: THREE.FrontSide,
                            transparent: true,
                            map: texture,
                            opacity: 1
                        });

                        circle = new THREE.Mesh(pointGeometry, pointMaterial);
                        circle.position.z = 1;
                        mesh.add(circle);
                    }
                );
            }

            function makePanelHotspot() {
                var spotWidth = GeoFactory.map(config.data.width, 0, 1, 0, config.planeWidth);
                var spotHeight = GeoFactory.map(config.data.height, 0, 1, 0, config.planeHeight);
                var geometry = new THREE.PlaneGeometry(spotWidth, spotHeight, 32);
                mesh = new THREE.Mesh(geometry, material);
                mesh.position.z = 1;
                mesh.position.x = GeoFactory.map(config.data.x, 0, 1, - config.planeWidth / 2, config.planeWidth / 2);
                mesh.position.y = GeoFactory.map(config.data.y, 0, 1, config.planeHeight / 2, - config.planeHeight / 2);
                mesh.position.x += spotWidth / 2;
                mesh.position.y -= spotHeight / 2;
                //account for z of 1 offset:
                mesh.scale.x = 0.95;
                mesh.scale.y = 0.95;
            }

            function makeCylinderHotspot() {

            }

            function makeSphereHotspot() {

            }

            (function init() {
                config = _.extend(defaults, config);
                config.hotspotType = 'Visible Rectangles';
                switch (config.sceneType) {
                    case 'cylinder':
                        makeCylinderHotspot();
                        break;
                    case 'sphere':
                        makeSphereHotspot();
                        break;
                    default:
                        makePanelHotspot();
                        break;
                }

                //makePoint();
                mesh.name = 'hotspot';
                mesh.hotspot = config.data;
                mesh.showing = false;
                mesh.isVisible = true;

                if (config.hotspotType === 'Visible Points') {
                    makePoint();
                }

                if (config.hotspotType === 'Visible Rectangles') {
                    show();
                }

                // add our public methods to this object:
                mesh.show = show;
                mesh.hide = hide;
                mesh.flash = flash;
            })();

            return mesh;
        };
    }
]);
