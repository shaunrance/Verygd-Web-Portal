/* global angular, _ */
angular.module('ua5App.viewer')
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $stateProvider.state('viewer', {
            url: '/viewer/:projectId/:scene',
            templateUrl: 'states/viewer/viewer.html',
            controller: 'viewerCtrl',
            controllerAs: 'ctrl',
            resolve: {
                content: ['screenFactory', '$stateParams', function(screenFactory, $stateParams) {
                    return screenFactory.getScreens($stateParams.projectId).then(function(response) {
                        return response;
                    });
                }]
            }
        });
    }])
    .controller('viewerCtrl', ['$scope', '$stateParams', 'content', 'screenFactory', 'BrowserFactory', function($scope, $stateParams, content, screenFactory, BrowserFactory) {
        var lastScene = 1;
        $scope.scene = parseInt($stateParams.scene, 10);
        $scope.projectId = $stateParams.projectId;
        $scope.useVr = false;
        $scope.touch = BrowserFactory.hasTouch();
        $scope.content = content.data.content;
        $scope.currentSceneScreens = _.where($scope.content, {tag: $scope.scene.toString()});

        _.each($scope.content, function(screen) {
            if (parseInt(screen.tag, 10) > lastScene) {
                lastScene = parseInt(screen.tag, 10);
            }
        });

        $scope.toggleCardboard = function() {
            $scope.useVr = !$scope.useVr;
        };

        $scope.exit = function() {
            window.history.back();
        };
        
        // right now we're going to simulate a scene change between two projects
        $scope.$on('scene:change', function(event, data) {
            var targetScene = parseInt(data.link, 10);
            if (targetScene > 0) {
                $scope.scene = targetScene;
                $scope.currentSceneScreens = _.where($scope.content, {tag: $scope.scene.toString()});
                $scope.$apply();                
            }
        });
    }])
;
