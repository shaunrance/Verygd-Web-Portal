/* global angular */
angular.module('ua5App.viewer')
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $stateProvider.state('viewer', {
            url: '/viewer/:version',
            templateUrl: 'states/viewer/viewer.html',
            controller: 'viewerCtrl',
            controllerAs: 'ctrl'
        });
    }])
    .controller('viewerCtrl', ['$scope', '$stateParams', function($scope, $stateParams) {
        if ($stateParams.version === 'cardboard') {
            $scope.useVr = true;
        } else {
            $scope.useVr = false;
        }
    }])
;
