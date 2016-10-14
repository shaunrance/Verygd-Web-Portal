/* global angular */
angular.module('ua5App')
    .directive('header', ['$state', '$http', 'APICONSTANTS', '$cookies', '$rootScope', function($state, $http, APICONSTANTS, $cookies, $rootScope) {
        return {
            restrict: 'A',
            templateUrl: 'components/header/header.html',
            scope: {
                basic: '@'
            },
            link: function($scope, element, attrs) {
            },
            controller: ['$scope', '$state', '$stateParams', '$rootScope', 'projectFactory', function($scope, $state, $stateParams, $rootScope, projectFactory) {
                $scope.projectTitle = '';
                $scope.userMenuToggle = false;
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
                            $scope.projectTitle = response.data.title;

                        }, function(error) {

                        });
                    }
                }

                getProjectName();

                $scope.logout = function() {
                    //remove cookies
                    $cookies.remove(APICONSTANTS.authCookie.token);
                    $cookies.remove(APICONSTANTS.authCookie.user_id);
                    $cookies.remove(APICONSTANTS.authCookie.patient_id);

                    //TODO hit endpoint to expire auth token
                    //redirect to login
                    $state.go('home');
                };
            }]
        };
    }])
;
