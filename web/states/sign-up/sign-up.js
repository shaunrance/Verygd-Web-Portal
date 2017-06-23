/* global angular, $ */
angular.module('ua5App.sign-up')
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.when('', '/sign-up');
        $urlRouterProvider.otherwise('/sign-up');
        $stateProvider.state('sign-up', {
            url: '/sign-up',
            templateUrl: 'states/sign-up/sign-up.html',
            controller: 'signUpCtrl',
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
    .controller('signUpCtrl', ['$scope', '$http', 'user', 'ModalService', 'UsersResource', 'AuthResource', '$state', 'APICONSTANTS', '$cookies', '$rootScope', 'ngMeta', 'intercomFactory', function($scope, $http, ModalService, user, UsersResource, AuthResource, $state, APICONSTANTS, $cookies, $rootScope, ngMeta, intercomFactory) {
        $scope.disableButton = false;

        $scope.showModal = function() {
            $('body').addClass('no-scroll');
            ModalService.showModal({
                templateUrl: 'modals/signUpModal.html',
                controller: 'signUpModalController',
                inputs: {
                    fields:{
                        title: 'sduhk'
                    }
                }
            });
        };

        function handleSignUp(response) {
            UsersResource.resetUser();
            //set cookie token && then go to projects
            $cookies.put(APICONSTANTS.authCookie.token, response.token);
            $cookies.put(APICONSTANTS.authCookie.user_id, response.member_id);
            $cookies.put(APICONSTANTS.authCookie.intercom_token, response.intercom_token);

            $http.defaults.headers.common['Authorization'] = 'Token ' + response.token; //jshint ignore:line

            $state.go('projects');
            intercomFactory.ping();
            $('body').removeClass('no-scroll');
        }

        $scope.signUpFB = function() {
            AuthResource.facebookConnect().then(
                function(response) {
                    handleSignUp(response);
                },
                function(error) {
                    $scope.loginError = true;
                    $scope.errorMessage = error.data.error[0];
                }
            );
        };

        $scope.authUser = function(user) {
            AuthResource.token().retrieve({username: user.email, password: user.password}).$promise.then(
                function(response) {
                    handleSignUp(response);
                },
                function(error) {
                    $state.go('sign-up');
                }
            );
        };

        $scope.createUser = function(data) {
            var user;
            $scope.disableButton = true;

            user = {
                full_name: data.name,
                email: data.email,
                password: data.password
            };

            UsersResource.signup().create(user).$promise.then(
                function(response) {
                    $scope.authUser(user);
                },
                function(error) {
                    $scope.disableButton = false;
                    $scope.loginError = true;

                    if (error && error.data) {
                        var errors = [];

                        //TODO remove this after the API is working
                        if (error.data === '<h1>Server Error (500)</h1>') {
                            $scope.authUser(user);
                        }

                        //display error message & if possible, go to section with the first error
                        if (error.data.email) {
                            errors.push('This email address is already in use.');
                            $scope.emailDuplicate = true;
                        }

                        $scope.errorMessage = errors;
                    } else {
                        $scope.errorMessage = 'Sorry! There seems to have been an error creating your account. Please try again.';
                    }

                    return false;
                }
            );
        };
        ngMeta.setTitle('Sign Up');
    }])
;
