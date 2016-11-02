/* global angular, $ */
angular.module('ua5App.terms-and-conditions')
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $stateProvider.state('terms-and-conditions', {
            name: 'Terms and Conditions',
            url: '/terms-and-conditions',
            templateUrl: 'states/terms-and-conditions/terms-and-conditions.html',
            controller: 'tacCtrl',
            controllerAs: 'ctrl',
            data: {
                settings:{displayName:'Terms And Conditions'}
            }
        });
    }])
    .controller('tacCtrl', ['ngMeta', function(ngMeta) {
        ngMeta.setTitle('Terms and Conditions');
        $('body').off('click');
    }])
;
