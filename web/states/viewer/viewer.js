/* global angular */
angular.module('ua5App.viewer')
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $stateProvider.state('viewer', {
            url: '/viewer/:projectId/:version',
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
        var OTHER_SCENE = 117;
        var current = $stateParams.projectId;
        if ($stateParams.version === 'cardboard') {
            $scope.useVr = true;
        } else {
            $scope.useVr = false;
        }

        $scope.content = content.data.content;
        
        // right now we're going to simulate a scene change between two projects
        $scope.$on('scene:change', function() {
            current = (current === $stateParams.projectId) ? OTHER_SCENE : $stateParams.projectId;
            screenFactory.getScreens(current).then(function(response) {
                $scope.content = response.data.content;
            });
        });
    }])
;
