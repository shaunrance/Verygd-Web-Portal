/* global angular, $, _ */
angular.module('ua5App.viewer')
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('viewer', {
                url: '/viewer/:projectId/:scene',
                templateUrl: 'states/viewer/viewer.html',
                controller: 'viewerCtrl',
                controllerAs: 'ctrl',
                resolve: {
                    content: ['projectFactory', '$stateParams', function(projectFactory, $stateParams) {
                        return projectFactory.getProjectById($stateParams.projectId).then(function(response) {
                            return response.data.content;
                        });
                    }]
                }
            })
            .state('publicViewer', {
                url: '/p/:projectId/:scene',
                templateUrl: 'states/viewer/viewer.html',
                controller: 'viewerCtrl',
                controllerAs: 'ctrl',
                resolve: {
                    project: ['projectFactory', '$stateParams', '$q', function(projectFactory, $stateParams, $q) {
                        return projectFactory.getProjectByPubId($stateParams.projectId).then(function(response) {
                            return response.data;
                        });
                    }]
                }
            });
    }])
    .controller('viewerCtrl', ['$scope', '$stateParams', 'project', 'sceneFactory', 'BrowserFactory', 'ngMeta', '$state', function($scope, $stateParams, project, sceneFactory, BrowserFactory, ngMeta, $state) {
        var lastScene = 1;
        $scope.scenes = project.content;
        $scope.touch = BrowserFactory.hasTouch();
        $scope.useVr = false;

        ngMeta.setTitle('Viewer');

        $scope.isPublic = ($state.current.name === 'v');

        function applyContent() {
            $scope.background = $scope.currentScene.background;

            if ($scope.currentScene.content.length > 1) {
                // first check to see if more than one panel exists, then check if its panorama
                $scope.content = $scope.currentScene.is_panorama ? [$scope.currentScene.content[0]] : $scope.currentScene.content;
            } else {
                $scope.content = $scope.currentScene.content;
            }

            $scope.currentScenePanels = $scope.content;
            $scope.currentScenePanels = _.sortBy($scope.currentScenePanels, 'order');

            if ($scope.content.length > 1) {
                _.each($scope.content, function(panel) {
                    if (panel.id > lastScene) {
                        lastScene = panel.id;
                    }
                });
            }

            _.each($scope.currentScene.content, function(item) {
                item.hotspots = item.hotspots;
                if (item.hotspots === null) {
                    item.hotspots = [];
                }
            });
        }

        function filterScenes() {
            _.each($scope.scenes, function(scene) {
                if (scene.id === parseInt($stateParams.scene, 10)) {
                    $scope.currentScene = scene;
                    applyContent();
                }
            });
        }

        $scope.toggleCardboard = function() {
            $scope.useVr = !$scope.useVr;
        };

        $scope.exit = function() {
            window.history.back();
        };

        // right now we're going to simulate a scene change between two projects
        $scope.$on('scene:change', function(event, data) {
            var targetScene = parseInt(data.link, 10);

            if (targetScene !== '') {
                _.each($scope.scenes, function(scene) {
                    if (scene.id === targetScene) {
                        $scope.currentScene = scene;
                        applyContent();
                        $scope.$apply();
                    }
                });
            }
        });

        $('body').off('click');

        filterScenes();
        ngMeta.setTitle(project.name);
        ngMeta.setTag('url', 'https://app.very.gd/p/' + project.short_uuid + '/' + $scope.currentScene.id);
        ngMeta.setTag('image', $scope.currentScene.content[0].url + '?w=1200&h=628&fit=crop&crop=entropy');
    }])
;
