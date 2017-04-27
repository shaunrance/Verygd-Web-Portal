/* global angular, $ */
angular.module('ua5App.sign-in')
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $stateProvider.state('sign-in', {
            url: '/sign-in',
            templateUrl: 'states/sign-in/sign-in.html',
            controller: 'SignInCtrl',
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
    .controller('SignInCtrl', ['$scope', 'user', 'AuthResource', 'UsersResource', '$state', 'APICONSTANTS', '$cookies', 'ModalService', '$rootScope', '$http', 'ngMeta', 'intercomFactory', 'Facebook', function($scope, user, AuthResource, UsersResource, $state, APICONSTANTS, $cookies, ModalService, $rootScope, $http, ngMeta, intercomFactory, Facebook) {
        if (user) {
            $state.go('projects');
            $('body').removeClass('no-scroll');
        }

        $scope.errorMessage = 'The email and password you entered don’t match. Please try again.';

        $scope.$watch(function() {
            // This is for convenience, to notify if Facebook is loaded and ready to go.
            return Facebook.isReady();
        }, function(newVal) {
            // You might want to use this to disable/show/hide buttons and else
            $scope.facebookReady = true;
        });

        $scope.loginFB = function() {
            AuthResource.facebookConnect().then(
                function(response) {
                    handleLogin(response);
                },
                function(error) {
                    $scope.loginError = true;
                    $scope.errorMessage = error.data.error[0];
                }
            );
        };

        $scope.logout = function() {
            Facebook.logout(function() {
                $scope.$apply(function() {
                    $scope.user   = {};
                    $scope.logged = false;
                });
            });
        };

        $scope.getLoginStatus = function() {
            Facebook.getLoginStatus(function(response) {
                if (response.status === 'connected') {
                    $scope.loggedIn = true;
                    //$scope.loginFB();
                } else {
                    $scope.loggedIn = false;
                }
            });
        };

        $scope.getLoginStatus();

        $scope.login = function(data) {
            if (!data && (!data.email || !data.password)) {
                return false;
            }

            AuthResource.token().retrieve({username: data.email, password: data.password}).$promise.then(
                function(response) {
                    handleLogin(response);
                },
                function(error) {
                    $scope.loginError = true;
                }
            );
        };

        function handleLogin(response) {
            //base expiration of cookies based on whether 'remember me' option was checked
            var todayDate = new Date();
            var expireDate = new Date();
            UsersResource.resetUser();
            //set cookies
            if ($scope.cookieExpireDate) {
                expireDate.setDate(todayDate.getDate() + 365);
                $cookies.put(APICONSTANTS.authCookie.token, response.token, {expires: expireDate});
                $cookies.put(APICONSTANTS.authCookie.user_id, response.member_id, {expires: expireDate});
                $cookies.put(APICONSTANTS.authCookie.intercom_token, response.intercom_token, {expires: expireDate});
            } else {
                expireDate.setDate(todayDate.getDate() + 1);
                $cookies.put(APICONSTANTS.authCookie.token, response.token, {expires: expireDate});
                $cookies.put(APICONSTANTS.authCookie.user_id, response.member_id, {expires: expireDate});
                $cookies.put(APICONSTANTS.authCookie.intercom_token, response.intercom_token, {expires: expireDate});
            }

            $http.defaults.headers.common['Authorization'] = 'Token ' + APICONSTANTS.authCookie.token; // jshint ignore:line
            intercomFactory.ping();

            $state.go('projects');
        }

        $scope.showModal = function() {
            ModalService.showModal({
                templateUrl: 'modals/signInModal.html',
                controller: 'signInModalController',
                inputs: {
                    fields:{
                        title: 'sduhk'
                    }
                }
            });
        };

        ngMeta.setTitle('Sign In');
    }])
;
