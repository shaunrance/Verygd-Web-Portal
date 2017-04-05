/* global angular, THREE, _, TweenMax */
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
                opacity: 0
            });

            var show = function() {
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
            };

            function getCentroid(mesh) {
                var boundingBox;
                mesh.geometry.computeBoundingBox();
                boundingBox = mesh.geometry.boundingBox;

                var x0 = boundingBox.min.x;
                var x1 = boundingBox.max.x;
                var y0 = boundingBox.min.y;
                var y1 = boundingBox.max.y;
                var z0 = boundingBox.min.z;
                var z1 = boundingBox.max.z;

                var bWidth = ( x0 > x1 ) ? x0 - x1 : x1 - x0;
                var bHeight = ( y0 > y1 ) ? y0 - y1 : y1 - y0;
                var bDepth = ( z0 > z1 ) ? z0 - z1 : z1 - z0;

                var centroidX = x0 + ( bWidth / 2 ) + mesh.position.x;
                var centroidY = y0 + ( bHeight / 2 )+ mesh.position.y;
                var centroidZ = z0 + ( bDepth / 2 ) + mesh.position.z;

                return mesh.geometry.centroid = { x : centroidX, y : centroidY, z : centroidZ };
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
                        var coords = getCentroid(mesh);
                        pointGeometry = new THREE.CircleGeometry(1, 32);
                        pointMaterial = new THREE.MeshBasicMaterial({
                            side: THREE.DoubleSide,
                            transparent: true,
                            map: texture,
                            opacity: 1
                        });

                        circle = new THREE.Mesh(pointGeometry, pointMaterial);
                        circle.position.z = 1;

                        if (config.sceneType === 'cylinder' || config.sceneType === 'sphere') {
                            circle.position.set(coords.x, circle.position.y, coords.z);
                            circle.scale.x = 2.95;
                            circle.scale.y = 1.95;
                        }
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
                var CYL_OFFSET_Y = 8;
                var degreesPos = config.data.x * 360.0;
                var radiansPos = degreesPos * (Math.PI / 180);
                var degreesWidth = config.data.width * 360.0;
                var radiansWidth = degreesWidth * (Math.PI / 180);
                var spotWidth = radiansWidth;
                var spotPos = radiansPos;
                var spotHeight = GeoFactory.map(config.data.height, 0, 1, 0, config.planeHeight);
                var spotY = GeoFactory.map(config.data.y, 0, 1, config.planeHeight / 2, - config.planeHeight / 2);
                var geometry;

                spotPos = (2 * Math.PI) - spotPos - spotWidth;

                geometry = new THREE.CylinderGeometry(150, 150, spotHeight, 20, 1, true, spotPos, spotWidth);
                mesh = new THREE.Mesh(geometry, material);
                mesh.scale.set(-0.9, 0.9, 0.9);
                mesh.position.y = CYL_OFFSET_Y + spotY - (spotHeight / 2);
                //mesh.rotation.y = 4.723;
            }

            function makeSphereHotspot() {
                var radius = config.radius;
                var spotWidth = config.data.width * Math.PI * 2;
                var rotationYPos = (config.data.x * Math.PI * 2) - (Math.PI / 2);
                var spotHeight = GeoFactory.map(config.data.height, 0, 1, 0, (radius * 2));
                var spotY = GeoFactory.map(config.data.y, 0, 1, radius / 1.25, radius / -1.25) - (spotHeight / 2);
                var xAndZLength = Math.sqrt((Math.pow(radius, 2) - Math.pow(spotY, 2)) / 2);
                var xAndZRotation = Math.atan(spotY / xAndZLength);

                rotationYPos = (2 * Math.PI) - rotationYPos - spotWidth;
                geometry = new THREE.CylinderGeometry((radius * 0.7), (radius * 0.7), spotHeight, 20, 1, true, rotationYPos, spotWidth);
                mesh = new THREE.Mesh(geometry, material);
                mesh.scale.set(-0.9, 0.9, 0.9);
                mesh.position.y = spotY;
                if (rotationYPos >= 0 && rotationYPos < (Math.PI / 2)) {
                    mesh.rotation.x = xAndZRotation;
                    mesh.rotation.z = xAndZRotation;
                } else if (rotationYPos >= (Math.PI / 2) && rotationYPos < Math.PI) {
                    mesh.rotation.x = xAndZRotation;
                    mesh.rotation.z = -xAndZRotation;
                } else if (rotationYPos >= Math.PI && rotationYPos < (Math.PI * (3 / 2))) {
                    mesh.rotation.x = -xAndZRotation;
                    mesh.rotation.z = -xAndZRotation;
                } else if (rotationYPos >= (Math.PI * (3 / 2)) && rotationYPos < (Math.PI * 2)) {
                    mesh.rotation.x = -xAndZRotation;
                    mesh.rotation.z = xAndZRotation;
                }
                if (spotY < 0) {
                    mesh.rotation.x *= -1;
                    mesh.rotation.z *= -1;
                }
            }

            (function init() {
                config = _.extend(defaults, config);
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
