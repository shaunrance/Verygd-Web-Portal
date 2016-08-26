/* global angular */
angular.module('ua5App.viewer')
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $stateProvider.state('viewer', {
            url: '/viewer',
            templateUrl: 'states/viewer/viewer.html',
            controller: 'viewerCtrl',
            controllerAs: 'ctrl'
        });
    }])
    .controller('viewerCtrl', [function() {}])
;
