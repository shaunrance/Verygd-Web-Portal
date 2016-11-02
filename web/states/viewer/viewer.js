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
            .state('v', {
                url: '/p/:projectId/:scene',
                templateUrl: 'states/viewer/viewer.html',
                controller: 'viewerCtrl',
                controllerAs: 'ctrl',
                resolve: {
                    content: ['projectFactory', '$stateParams', '$q', function(projectFactory, $stateParams, $q) {
                        return projectFactory.getProjectByPubId($stateParams.projectId).then(function(response) {
                            return response.data.content;
                        });
                    }]
                }
            });
    }])
    .controller('viewerCtrl', ['$scope', '$stateParams', 'content', 'sceneFactory', 'BrowserFactory', 'ngMeta', function($scope, $stateParams, content, sceneFactory, BrowserFactory, ngMeta) {
        var lastScene = 1;
        $scope.scenes = content;
        $scope.touch = BrowserFactory.hasTouch();
        $scope.useVr = false;

        function applyContent() {
            $scope.background = $scope.currentScene.background;

            if ($scope.currentScene.content.length > 1) {
                // first check to see if more than one panel exists, then check if its panorama
                $scope.content = $scope.currentScene.is_panorama ? _.where($scope.currentScene.content, {order: 0}) : $scope.currentScene.content;
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

        ngMeta.setTitle('Viewer');
    }])
;
