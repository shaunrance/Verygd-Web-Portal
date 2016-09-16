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
    .controller('viewerCtrl', ['$scope', '$stateParams', 'content', function($scope, $stateParams, content) {
        if ($stateParams.version === 'cardboard') {
            $scope.useVr = true;
        } else {
            $scope.useVr = false;
        }

        $scope.content = content.data.content;
    }])
;
// http://api.very.gd.ua5.land:8080/photos
