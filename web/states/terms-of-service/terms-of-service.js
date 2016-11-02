/* global angular, $ */
angular.module('ua5App.terms-of-service')
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $stateProvider.state('terms-of-service', {
            name: 'Terms of Service',
            url: '/terms-of-service',
            templateUrl: 'states/terms-of-service/terms-of-service.html',
            controller: 'tosCtrl',
            controllerAs: 'ctrl',
            data: {
                settings:{displayName:'Terms And Conditions'}
            }
        });
    }])
    .controller('tosCtrl', ['ngMeta', function(ngMeta) {
        ngMeta.setTitle('Terms of Service');
        $('body').off('click');
    }])
;
