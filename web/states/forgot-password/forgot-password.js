/* global angular */
angular.module('ua5App.forgot-password')
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $stateProvider.state('forgot-password', {
            url: '/forgot-password',
            templateUrl: 'states/forgot-password/forgot-password.html',
            controller: 'ForgotPasswordCtrl',
            controllerAs: 'ctrl',
            resolve: {
                user: ['APICONSTANTS', '$cookies', function(APICONSTANTS, $cookies) {
                    var userId = $cookies.get(APICONSTANTS.authCookie.user_id);
                    var token = $cookies.get(APICONSTANTS.authCookie.user_id);

                    if (userId && token) {
                        return true;
                    } else {
                        return false;
                    }
                }]
            }
        });
    }])
    .controller('ForgotPasswordCtrl', ['$scope', 'user', 'AuthResource', 'UsersResource', '$state', 'APICONSTANTS', '$cookies', 'ModalService', '$rootScope', '$http', function($scope, user, AuthResource, UsersResource, $state, APICONSTANTS, $cookies, ModalService, $rootScope, $http) {

        $scope.submit = function(data) {
            if (!data && (!data.email)) {
                return false;
            }

            UsersResource.forgotPass().send({email: data.email}).$promise.then(
                function(response) {
                    //send email code
                    $scope.forgotMessage = response.msg;
                    $scope.model.email = '';
                },
                function(error) {
                    console.log(error);
                    //$scope.loginError = true;
                }
            );
        };
    }])
;
