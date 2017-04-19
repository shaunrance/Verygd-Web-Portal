/* global angular, $ */
angular.module('ua5App')
    .directive('header', ['$state', '$http', 'APICONSTANTS', '$cookies', '$rootScope', function($state, $http, APICONSTANTS, $cookies, $rootScope) {
        return {
            restrict: 'A',
            templateUrl: 'components/header/header.html',
            scope: {
                basic: '@',
                headerTitleData: '=',
                headerLink: '=',
                public: '@' //jshint ignore:line
            },
            link: function($scope, element, attrs) {
            },
            controller: ['$scope', '$state', '$stateParams', '$rootScope', 'projectFactory', 'UsersResource', 'ModalService', 'intercomFactory', function($scope, $state, $stateParams, $rootScope, projectFactory, UsersResource, ModalService, intercomFactory) {
                var keys = {37: 1, 38: 1, 39: 1, 40: 1};

                $scope.projectTitle = '';
                $scope.mobileUserMenuToggle = false;
                $scope.userMenuToggle = false;
                $scope.notificationToggle = false;
                $scope.isActive = false;
                $scope.billingMenuName = 'Upgrade Plan';

                $scope.backButtonHide = true;
                $scope.goBack = function() {
                    $state.go('projects', {}, {reload: true});
                };

                $scope.openShare = function() {
                    ModalService.showModal({
                        templateUrl: 'modals/shareModal.html',
                        controller: 'shareModalController',
                        inputs: {
                            fields:{
                                title: 'Share Project',
                                formLabels:[{title: 'URL'}],
                                showFileUpload: false,
                                submitButtonText: 'Share',
                                project: $stateParams.projectId
                            }
                        }
                    }).then(function(modal) {
                        modal.close.then(function(result) {
                            $('body').removeClass('no-scroll');
                        });
                    });
                };

                UsersResource.get().then(function(response) {
                    $scope.user = response[0];
                    if ($scope.user.payment) {
                        if ($scope.user.payment.plan_name === 'basic') {
                            $scope.billingMenuName = 'Upgrade Plan';
                        } else {
                            $scope.billingMenuName = 'Billing';
                        }
                    }
                    $scope.storageMaxMB = Math.floor(($scope.user.total_content_bytes + $scope.user.content_bytes_left) / 10e5);
                    $scope.storageCurrentMB = Math.floor($scope.user.total_content_bytes / 10e5);
                    $scope.storagePercent = Math.floor(($scope.storageCurrentMB / $scope.storageMaxMB) * 100);
                    if ($scope.storagePercent > 75) {
                        $scope.storageBarFillColor = '#FF0000';
                    } else {
                        $scope.storageBarFillColor = '#53a0fd;';
                    }
                });

                $scope.goLink = function() {
                    $state.go($scope.headerLink, {}, {reload: true});
                };

                $rootScope.$on('$stateChangeSuccess', function(event, to, toParams, from, fromParams) {
                    $rootScope.previousState = from;
                    getProjectName();
                });

                function getProjectName() {
                    if ($stateParams.projectId === undefined) {
                        $scope.projectTitle = '';
                    }else {
                        projectFactory.getProjectById($stateParams.projectId)

                        .then(function(response) {
                            $scope.projectTitle = response.data.name;

                        }, function(error) {

                        });
                    }
                }

                function preventDefault(e) {
                    e = e || window.event;
                    if (e.preventDefault) {
                        e.preventDefault();
                    }
                    e.returnValue = false;
                }

                function preventDefaultForScrollKeys(e) {
                    if (keys[e.keyCode]) {
                        preventDefault(e);
                        return false;
                    }
                }

                function disableScroll() {
                    if (window.addEventListener) {
                        window.addEventListener('DOMMouseScroll', preventDefault, false); // older FF
                    }
                    window.onwheel = preventDefault; // modern standard
                    window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
                    window.ontouchmove  = preventDefault; // mobile
                    document.onkeydown  = preventDefaultForScrollKeys;
                }

                function enableScroll() {
                    if (window.removeEventListener) {
                        window.removeEventListener('DOMMouseScroll', preventDefault, false);
                    }
                    window.onmousewheel = document.onmousewheel = null;
                    window.onwheel = null;
                    window.ontouchmove = null;
                    document.onkeydown = null;
                }

                getProjectName();

                $scope.logout = function() {
                    //remove cookies
                    $cookies.remove(APICONSTANTS.authCookie.token);
                    $cookies.remove(APICONSTANTS.authCookie.user_id);
                    $cookies.remove(APICONSTANTS.authCookie.patient_id);
                    $cookies.remove(APICONSTANTS.authCookie.intercom_token);
                    intercomFactory.shutdown();
                    $('body').off('click');
                    UsersResource.resetUser();
                    //TODO hit endpoint to expire auth token
                    //redirect to login
                    $state.go('sign-in');
                };

                $scope.toggleMenuMobile = function() {
                    if (!$scope.mobileUserMenuToggle) {
                        $scope.mobileUserMenuToggle = true;
                        disableScroll();
                    } else {
                        $scope.mobileUserMenuToggle = false;
                        enableScroll();
                    }
                };

                $scope.toggleMenu = function() {
                    if ($scope.notificationToggle) {
                        $scope.notificationToggle = false;
                    }

                    $scope.userMenuToggle = !$scope.userMenuToggle;
                };

                $scope.toggleNotification = function() {
                    if ($scope.userMenuToggle) {
                        $scope.userMenuToggle = false;
                    }

                    $scope.notificationToggle = !$scope.notificationToggle;
                };

                $scope.closeMenu = function() {
                    $scope.mobileUserMenuToggle = false;
                };

                // Body click event to close dekstop user menu
                $('body').on('click', function(event) {
                    if (!$(event.target).closest('.header__user-container').length) {
                        var scope = angular.element($('.header')).scope();
                        if (scope) {
                            if (scope.userMenuToggle || scope.notificationToggle) {
                                scope.$apply(function() {
                                    scope.userMenuToggle = false;
                                    scope.notificationToggle = false;
                                });
                            }
                        }
                    }
                });
            }]
        };
    }])
;
