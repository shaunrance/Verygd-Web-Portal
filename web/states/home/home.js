/* global angular */
angular.module('ua5App.home')
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.when('', '/');
        $urlRouterProvider.otherwise('/');
        $stateProvider.state('home', {
            name: 'Home',
            url: '/',
            templateUrl: 'states/home/home.html',
            controller: 'HomeCtrl',
            controllerAs: 'ctrl',
            data: {
                settings: {displayName:'Home'}
            }
        });
    }])
    .controller('HomeCtrl', [function() {}])
;
