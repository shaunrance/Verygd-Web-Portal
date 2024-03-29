/* global angular, $ */
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
            },
            resolve: {
                user: ['UsersResource', function(UsersResource) {
                    return UsersResource.get().then(function(user) {
                        return user;
                    });
                }]
            }
        });
    }])
    .controller('accountCtrl', ['$rootScope', '$scope', '$state', 'APICONSTANTS', '$cookies', 'user', 'UsersResource', 'ngMeta', function($rootScope, $scope, $state, APICONSTANTS, $cookies, user, UsersResource, ngMeta) {
        $scope.userId = $cookies.get(APICONSTANTS.authCookie.user_id);
        $scope.name = {};
        $scope.email = {};
        $scope.password = {};

        $rootScope.$on('$locationChangeStart', function() {
            $scope.passMessage = '';
            $scope.password.password = '';
        });

        if (!$scope.userId) {
            $state.go('sign-in');
        }

        function getUserInfo() {
            //We have set a deferred rootscope promise in app.js
            //the header will set this response for the user object
            //and then other components that need to make use of this response
            //(ie feed.js) can use $rootScope.deferredUser.promise.then(function(response)
            if ($rootScope.userResponse) {
                $scope.userName = $rootScope.userResponse.name;
                $scope.userAdmin = true; //TODO set this correctly after other members can be added
            } else {
                var userId = $cookies.get(APICONSTANTS.authCookie.user_id);

                if (!userId) {
                    $state.go('sign-in');
                } else {
                    $scope.user = user[0];
                    $scope.name.name = $scope.user.full_name;
                    $scope.email.email = $scope.user.email;
                    $scope.title = $scope.user.full_name;
                    $scope.link = 'account';
                }
            }
        }

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

        $scope.saveUser = function() {
            var userObj;
            var passObj;

            if ($scope.email.email !== '' && $scope.email.email !== $scope.user.email && $scope.name.name !== '' && $scope.name.name !== $scope.user.name && $scope.password.password !== '') {
                if (checkValidPassword()) {
                    userObj = {
                        id: $scope.userId,
                        name: $scope.name.name,
                        email: $scope.email.email,
                        password: $scope.password.password
                    };
                    update(userObj);
                }
            } else if ($scope.email.email !== '' && $scope.email.email !== $scope.user.email) {
                userObj = {
                    id: $scope.userId,
                    email: $scope.email.email
                };
                update(userObj);
            } else if ($scope.name.name !== '' && $scope.name.name !== $scope.user.name) {
                userObj = {
                    id: $scope.userId,
                    name: $scope.name.name
                };
                update(userObj);
            } else if ($scope.password.password !== '') {
                if (checkValidPassword()) {
                    userObj = {
                        id: $scope.userId,
                        password: $scope.password.password
                    };
                    update(userObj);
                }
            }

            if ($scope.password.password !== '' && $scope.password.confirm !== '' && $scope.password.password !== undefined) {
                passObj = {
                    id: $scope.userId,
                    name: $scope.user.name,
                    email: $scope.user.email,
                    password: $scope.password.password
                };
                checkValidPassword(passObj);
            }
        };

        function update(userObj) {
            UsersResource.update().save(userObj).$promise.then(
                function(response) {
                    $scope.accountMessage = 'Account Updated.';
                    $scope.accountMessageError = false;
                    $scope.name.name = $scope.name.name;
                    $scope.email.email = $scope.email.email;
                    $scope.title = $scope.name.name;
                    $('.account-message').fadeIn(300);
                    setTimeout(function() {
                        $('.account-message').fadeOut(700);
                    }, 1500);
                },
                function(error) {
                    $scope.accountMessageError = true;
                    $scope.accountMessage = 'Update failed. Please check all fields and try again.';
                    $('.account-message').fadeIn(300);
                    setTimeout(function() {
                        $('.account-message').fadeOut(700);
                    }, 2000);
                }
            );
        }

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

        function init() {
            getUserInfo();
        }
        init();
        ngMeta.setTitle('My Account');
    }])
;
