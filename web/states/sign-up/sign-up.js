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
    .controller('signUpCtrl', ['$scope', '$http', 'user', 'ModalService', 'UsersResource', 'AuthResource', '$state', 'APICONSTANTS', '$cookies', '$rootScope', 'ngMeta', function($scope, $http, ModalService, user, UsersResource, AuthResource, $state, APICONSTANTS, $cookies, $rootScope, ngMeta) {
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

        $scope.authUser = function(user) {
            AuthResource.token().retrieve({username: user.email, password: user.password}).$promise.then(
                function(response) {
                    //set cookie token && then go to projects
                    $cookies.put(APICONSTANTS.authCookie.token, response.token);
                    $cookies.put(APICONSTANTS.authCookie.user_id, response.member_id);

                    $http.defaults.headers.common['Authorization'] = 'Token ' + response.token; //jshint ignore:line

                    $state.go('projects');
                    $('body').removeClass('no-scroll');

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
                name: data.name,
                email: data.email,
                password: data.password
            };

            UsersResource.signup().create(user).$promise.then(
                function(response) {
                    $scope.authUser(user);
                },
                function(error) {
                    $scope.disableButton = false;

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
