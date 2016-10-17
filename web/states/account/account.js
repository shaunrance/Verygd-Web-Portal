/* global angular */
angular.module('ua5App.account', ['ngFileUpload'])
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.when('account/account', '/account');
        $stateProvider.state('account', {
            name: 'Account',
            url: '/account',
            templateUrl: 'states/account/account.html',
            controller: 'accountCtrl',
            controllerAs: 'ctrl',
            data: {
                settings:{displayName: 'Account'}
            }
        });
    }])
    .controller('accountCtrl', ['$scope', '$state', 'APICONSTANTS', '$cookies', function($scope, $state, APICONSTANTS, $cookies) {

        $scope.userId = $cookies.get(APICONSTANTS.authCookie.user_id);
        if (!$scope.userId) {
            $scope.go('login');
        }

        $scope.title = 'John Smith';
    }])
;
