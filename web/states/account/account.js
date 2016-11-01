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
    .controller('accountCtrl', ['$rootScope', '$scope', '$state', 'APICONSTANTS', '$cookies', 'user', 'UsersResource', function($rootScope, $scope, $state, APICONSTANTS, $cookies, user, UsersResource) {
        $scope.userId = $cookies.get(APICONSTANTS.authCookie.user_id);
        $scope.user = {};

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
                    $scope.title = $scope.user.name;
                    $scope.link = 'account';
                    // $scope.email = $scope.user.email;
                    // $scope.userName = $scope.user.name;

                    // $scope.userAdmin = true; //TODO set this correctly after other members can be added
                    // UsersResource.get({id: userId}).then(function(response) {
                    //     $scope.user = response[0];
                    //     $scope.email = $scope.user.email;
                    //     $scope.userName = $scope.user.name;
                    //     $scope.title = $scope.user.userName;
                    // });
                    // UsersResource.user().retrieve({id: userId}).$promise.then(
                    //     function(response) {
                    //         $rootScope.userResponse = response;
                    //         $rootScope.deferredUser.resolve(response);
                    //
                    //         $scope.email = response.email;
                    //         $scope.userName = response.name;
                    //         $scope.title = $scope.userName;
                    //
                    //         $scope.userAdmin = true; //TODO set this correctly after other members can be added
                    //     },
                    //     function(error) {
                    //         if (error.status === 401) {
                    //             $state.go('sign-in');
                    //         }
                    //     }
                    // );
                }
            }
        }

        $scope.checkPass = function() {
            var pass1 = $('#password');
            var pass2 = $('#confirm-password');

            if (pass1.val() === pass2.val()) {
                $scope.passMismatch = false;
                $scope.passMessage = 'Passwords Match!';
            } else {
                $scope.passMismatch = true;
                $scope.passMessage = 'Passwords Do Not Match!';
            }
        };

        $scope.saveUser = function() {
            var userObj;
            if ($scope.user.email !== '' && $scope.user.name !== '' && $scope.user.password !== '') {
                userObj = {
                    id: $scope.userId,
                    name: $scope.user.name,
                    email: $scope.user.email,
                    password: $scope.user.password
                };

                UsersResource.update().save(userObj).$promise.then(
                    function(response) {

                        console.log(response);
                    },
                    function(error) {

                    }
                );
            }
        };

        // function checkValidPassword() {
        //     if (pass1.value !== '' && pass2.value !== '') {
        //         if (pass1.value === pass2.value) {
        //             return true;
        //         } else {
        //             alert('Passwords do not match!');
        //             return false;
        //         }
        //     }
        // }

        function init() {
            getUserInfo();
        }
        init();
    }])
;
