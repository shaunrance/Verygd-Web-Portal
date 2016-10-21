/* global angular */
angular.module('ua5App')
    .directive('header', ['$state', '$http', 'APICONSTANTS', '$cookies', '$rootScope', function($state, $http, APICONSTANTS, $cookies, $rootScope) {
        return {
            restrict: 'A',
            templateUrl: 'components/header/header.html',
            scope: {
                basic: '@',
                headerTitleData: '='
            },
            link: function($scope, element, attrs) {
            },
            controller: ['$scope', '$state', '$stateParams', '$rootScope', 'projectFactory', function($scope, $state, $stateParams, $rootScope, projectFactory) {

                var keys = {37: 1, 38: 1, 39: 1, 40: 1};

                $scope.userMenuToggle = false;
                $scope.isActive = false;

                $scope.backButtonHide = true;
                $scope.goBack = function() {
                    $state.go('projects', {}, {reload: true});
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

                    //TODO hit endpoint to expire auth token
                    //redirect to login
                    $state.go('sign-in');
                };

                $scope.toggleMenu = function() {
                    if (!$scope.userMenuToggle) {
                        $scope.userMenuToggle = true;
                        disableScroll();
                    } else {
                        $scope.userMenuToggle = false;
                        enableScroll();
                    }
                };

                $scope.closeMenu = function() {
                    $scope.userMenuToggle = false;
                };
            }]
        };
    }])
;
