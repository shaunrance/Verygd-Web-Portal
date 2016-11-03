/* global angular, $ */
angular.module('ua5App.reset-password')
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $stateProvider.state('reset-password', {
            url: '/reset-password/{id}/{token}',
            templateUrl: 'states/reset-password/reset-password.html',
            controller: 'ResetPasswordCtrl',
            controllerAs: 'ctrl'
        });
    }])
    .controller('ResetPasswordCtrl', ['$scope', 'UsersResource', '$state', '$stateParams', 'APICONSTANTS', '$cookies', 'ModalService', '$rootScope', '$http', function($scope, UsersResource, $state, $stateParams, APICONSTANTS, $cookies, ModalService, $rootScope, $http) {

        $scope.submit = function(data) {
            if (data.password !== '') {
                if (checkValidPassword()) {
                    var passObj = {
                        id: $stateParams.id,
                        t: $stateParams.token,
                        new_password1: data.password,
                        new_password2: data.confirm
                    };
                    UsersResource.confirmPass().save(passObj).$promise.then(function(response) {
                        $scope.resetMessage = response.msg + ' Use the link below to log in.';
                        $scope.model.password = '';
                        $scope.model.confirm = '';
                        $scope.passMessage = '';
                    }, function(err) {
                        $scope.resetMessage = err.data.msg;
                    });

                }
            }
        };

        $scope.checkPass = function() {
            var pass1 = $('#password');
            var pass2 = $('#confirm-password');

            if (pass1.val() === pass2.val()) {
                $scope.passMismatch = false;
                $scope.passMessage = 'Passwords match!';
            } else {
                $scope.passMismatch = true;
                $scope.passMessage = 'Passwords do not match!';
            }
        };

        function checkValidPassword() {
            var pass1 = $('#password');
            var pass2 = $('#confirm-password');

            if (pass1.val() === pass2.val()) {
                return true;
            } else {
                alert('Passwords do not match!');
                return false;
            }
        }
    }])
;
