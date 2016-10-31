/* global angular, $, _ */
angular.module('ua5App.viewer')
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $stateProvider.state('viewer', {
            url: '/viewer/:projectId/:scene',
            templateUrl: 'states/viewer/viewer.html',
            controller: 'viewerCtrl',
            controllerAs: 'ctrl',
            resolve: {
                content: ['sceneFactory', '$stateParams', function(sceneFactory, $stateParams) {
                    return sceneFactory.getSceneById($stateParams.scene).then(function(response) {
                        return response;
                    });
                }]
            }
        });
    }])
    .controller('viewerCtrl', ['$scope', '$stateParams', 'content', 'sceneFactory', 'BrowserFactory', function($scope, $stateParams, content, sceneFactory, BrowserFactory) {
        var lastScene = 1;
        $scope.scene = parseInt($stateParams.scene, 10);
        $scope.projectId = $stateParams.projectId;
        $scope.useVr = false;
        $scope.background = content.data.background;
        $scope.touch = BrowserFactory.hasTouch();

        if (content.data.content.length > 1) {
            // first check to see if more than one panel exists, then check if its panorama
            $scope.content = content.data.is_panorama ? _.where(content.data.content, {order: 0}) : content.data.content;
        } else {
            $scope.content = content.data.content;
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
                $scope.scene = targetScene;
                sceneFactory.getSceneById($scope.scene)
                    .then(function(response) {
                        $scope.currentScenePanels = response.data.content;
                        $scope.currentScenePanels = _.sortBy($scope.currentScenePanels, 'order');
                        //this was causing $digest error, removing for now
                        //$scope.$apply();
                    });
            }
        });

        $('body').off('click');
    }])
;
