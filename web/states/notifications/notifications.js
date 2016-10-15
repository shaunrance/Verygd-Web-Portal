/* global angular */
angular.module('ua5App.notifications')
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $stateProvider.state('account.notifications', {
            name: 'Notifications',
            url: '/notifications',
            templateUrl: 'states/notifications/notifications.html',
            controller: 'notificationsCtrl',
            controllerAs: 'ctrl',
            data: {
                settings:{displayName:'Notifications'}
            }
        });
    }])
    .controller('notificationsCtrl', [function() {}])
;
