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
            var circle;
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
                    config.hotspotType === 'Visible Rectangles' ||
                    config.hotspotType === 'Visible Points'
                ) {
                    return;
                }
                show();
                TweenMax.delayedCall(0.5, hide);
            };

            function getCentroid(mesh) {
                var boundingBox, x0, x1, y0, y1, z0, z1, bWidth, bHeight, bDepth, centroidX, centroidY, centroidZ;
                mesh.geometry.computeBoundingBox();
                boundingBox = mesh.geometry.boundingBox;

                x0 = boundingBox.min.x;
                x1 = boundingBox.max.x;
                y0 = boundingBox.min.y;
                y1 = boundingBox.max.y;
                z0 = boundingBox.min.z;
                z1 = boundingBox.max.z;

                bWidth = (x0 > x1) ? x0 - x1 : x1 - x0;
                bHeight = (y0 > y1) ? y0 - y1 : y1 - y0;
                bDepth = (z0 > z1) ? z0 - z1 : z1 - z0;

                centroidX = x0 + (bWidth / 2) + mesh.position.x;
                centroidY = y0 + (bHeight / 2) + mesh.position.y;
                centroidZ = z0 + (bDepth / 2) + mesh.position.z;

                mesh.geometry.centroid = {x: centroidX, y: centroidY, z: centroidZ};
                return mesh.geometry.centroid;
            }

            function makePoint() {
                var pointGeometry;
                var pointMaterial;

                var coords = getCentroid(mesh);
                pointGeometry = new THREE.SphereGeometry(15, 32, 32);
                pointMaterial = new THREE.MeshBasicMaterial({
                    color: 0x81e4ee,
                    transparent: true,
                    opacity: 0.4
                });

                circle = new THREE.Mesh(pointGeometry, pointMaterial);
                circle.position.z = 1;
                circle.position.set(coords.x, coords.y, coords.z);

                if (config.sceneType === 'sphere') {
                    circle.scale.x = 1;
                    circle.scale.z = 1;
                    circle.scale.y = 1;
                } else if (config.sceneType === 'cylinder') {
                    circle.position.set(coords.x, coords.y, coords.z);
                    circle.scale.x = 0.4;
                    circle.scale.z = 0.4;
                    circle.scale.y = 0.4;

                    //add some buffer to keep points away from sinking into cyliner
                    if (circle.position.x > 0) {
                        circle.position.x -= 10;
                    } else {
                        circle.position.x += 10;
                    }
                    if (circle.position.z > 0) {
                        circle.position.z -= 10;
                    } else {
                        circle.position.z += 10;
                    }

                } else if (config.sceneType === 'panel') {
                    circle.scale.x = 0.1;
                    circle.scale.z = 0.1;
                    circle.scale.y = 0.1;
                }
                mesh.add(circle);
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

                //x coord (2 x PI === max width)
                var phiStart = config.data.x * Math.PI * 2;

                //width of the sphere:
                var phiLength = config.data.width * Math.PI * 2;

                //y coord (1 x PI === max height)
                var thetaStart = config.data.y * Math.PI;

                //height of the sphere:
                var thetaLength = config.data.height * Math.PI;

                var geometry = new THREE.SphereGeometry(radius, 32, 32, phiStart, phiLength, thetaStart, thetaLength);
                mesh = new THREE.Mesh(geometry, material);

                //scale our hotspot sphere to prevent artifacts
                mesh.scale.x = 0.5;
                mesh.scale.y = 0.5;
                mesh.scale.z = 0.5;
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

                if (config.hotspotType === 'Visible Points') {
                    makePoint();
                    mesh = circle;
                }

                if (config.hotspotType === 'Visible Rectangles') {
                    show();
                }

                //makePoint();
                mesh.name = 'hotspot';
                mesh.hotspot = config.data;
                mesh.showing = false;
                mesh.isVisible = true;

                // add our public methods to this object:
                mesh.show = show;
                mesh.hide = hide;
                mesh.flash = flash;
            })();

            return mesh;
        };
    }
]);
