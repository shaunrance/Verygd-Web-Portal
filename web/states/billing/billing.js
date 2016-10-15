/* global angular */
angular.module('ua5App.billing')
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $stateProvider.state('account.billing', {
            name: 'Billing',
            url: '/billing',
            templateUrl: 'states/billing/billing.html',
            controller: 'billingCtrl',
            controllerAs: 'ctrl',
            data: {
                settings:{displayName:'Billing'}
            }
        });
    }])
    .controller('billingCtrl', [function() {}])
;