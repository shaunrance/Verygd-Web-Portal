/* global angular */
angular.module('ua5App')
    .directive('header', [function() {
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
                $scope.backButtonHide = true;
                $scope.goBack = function() {
                    if ($rootScope.previousState !== undefined) {
                        $state.go($rootScope.previousState.name);
                    } else {
                        $state.go('projects');
                    }
                    
                };
                $rootScope.$on('$stateChangeSuccess', function(event, to, toParams, from, fromParams) {
                    $rootScope.previousState = from;
                    getProjectName();
                    $scope.backButtonHide = ($state.$current.name === 'projects') ? true : false;
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
            }]
        };
    }])
;
