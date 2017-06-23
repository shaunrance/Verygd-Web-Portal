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
                    project: ['projectFactory', '$stateParams', function(projectFactory, $stateParams) {
                        return projectFactory.getProjectById($stateParams.projectId).then(function(response) {
                            return response.data;
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
                        }, function(error) {
                            return error.data;
                        });
                    }]
                }
            });
    }])
    .controller('viewerCtrl', ['$scope', '$stateParams', 'project', 'sceneFactory', 'BrowserFactory', 'ngMeta', '$state', '$timeout', 'projectFactory', function($scope, $stateParams, project, sceneFactory, BrowserFactory, ngMeta, $state, $timeout, projectFactory) {
        var lastScene = 1;
        $scope.enabled = false;

        $scope.getProject = function(password) {
            projectFactory.getProjectByPubId($stateParams.projectId, password).then(function(response) {
                project = response.data;
                $scope.enabled = true;
                init();
            }, function() {
                checkIfEnabled();
            });
        };

        function checkIfEnabled() {
            if (typeof project === 'object') {
                $scope.enabled = true;
                init();
            } else if (project === 'password-protected') {
                var password = prompt('Password Required:', '');
                if (password) {
                    $scope.getProject(password);
                }
            }
        }

        checkIfEnabled();

        function init() {
            console.log('project.content', project.content);
            $scope.scenes = project.content;
            $scope.touch = BrowserFactory.hasTouch();
            $scope.iFrame = BrowserFactory.isIframe();
            $scope.mobile = BrowserFactory.isMobile();
            $scope.firstImage = $scope.scenes[0].content !== 'undefined' ? $scope.scenes[0].content[0].url : 'assets/img/black-background.png';
            $scope.useVr = false;

            $timeout(function() {
                $scope.url = 'https://app.very.gd/p/' + project.short_uuid + '/' + $scope.currentScene.id;
            }, 10);

            ngMeta.setTitle('Viewer');

            $scope.isPublicViewer = ($state.current.name === 'publicViewer');
            filterScenes();
            ngMeta.setTitle(project.name);
            ngMeta.setTag('url', 'https://app.very.gd/p/' + project.short_uuid + '/' + $scope.currentScene.id);
            ngMeta.setTag('image', $scope.currentScene.content[0].url + '?w=1200&h=628&fit=crop&crop=entropy&mark=https://app.very.gd/assets/img/logo-very_gd.png&markscale=5&markpad=20');
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
        }

        function applyContent() {
            $scope.background = $scope.currentScene.background;
            $scope.backgroundImage = $scope.currentScene.equirectangular_background_image;

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
        
        $('body').off('click');

    }])
;
