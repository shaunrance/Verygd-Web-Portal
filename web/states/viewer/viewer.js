/* global angular, _ */
angular.module('ua5App.viewer')
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $stateProvider.state('viewer', {
            url: '/viewer/:projectId/:scene/:version',
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
    .controller('viewerCtrl', ['$scope', '$stateParams', 'content', 'screenFactory', function($scope, $stateParams, content, screenFactory) {
        var scene = parseInt($stateParams.scene, 10);
        var lastScene = 1;
        if ($stateParams.version === 'cardboard') {
            $scope.useVr = true;
        } else {
            $scope.useVr = false;
        }

        $scope.content = content.data.content;
        $scope.currentSceneScreens = _.where($scope.content, {tag: scene.toString()});

        _.each($scope.content, function(screen) {
            if (parseInt(screen.tag, 10) > lastScene) {
                lastScene = parseInt(screen.tag, 10);
            }
        });
        
        // right now we're going to simulate a scene change between two projects
        $scope.$on('scene:change', function() {
            scene++;
            console.log(scene, lastScene);
            if (scene <= lastScene) {
                $scope.currentSceneScreens = _.where($scope.content, {tag: scene.toString()});
                $scope.$apply();
            } else {
                scene = 0;
                $scope.$broadcast('scene:change');
            }
        });
    }])
;
