/* global angular */
angular.module('ua5App.home')
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.when('', '/');
        $urlRouterProvider.otherwise('/');
        $stateProvider.state('home', {
            url: '/',
            templateUrl: 'states/home/home.html',
            controller: 'HomeCtrl',
            controllerAs: 'ctrl'
        });
    }])
    .controller('HomeCtrl', [function() {}])
;
