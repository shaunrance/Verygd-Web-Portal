/* global angular, $ */
angular.module('ua5App.privacy-policy')
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $stateProvider.state('privacy-policy', {
            name: 'Privacy Policy',
            url: '/privacy-policy',
            templateUrl: 'states/privacy-policy/privacy-policy.html',
            controller: 'ppCtrl',
            controllerAs: 'ctrl',
            data: {
                settings:{displayName:'Terms And Conditions'}
            }
        });
    }])
    .controller('ppCtrl', ['ngMeta', function(ngMeta) {
        ngMeta.setTitle('Privacy Policy');
        $('body').off('click');
    }])
;
