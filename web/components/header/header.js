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
            controller: ['$scope', '$state', '$rootScope', function($scope, $state, $rootScope) {
                $scope.backButtonToggle = false;
                $scope.goBack = function() {
                    if ($rootScope.previousState !== undefined) {

                        $state.go($rootScope.previousState.name);
                    }
                    
                };
                $rootScope.$on('$stateChangeSuccess', function(event, to, toParams, from, fromParams) {
                    //save the previous state in a rootScope variable so that it's accessible from everywhere
                    $rootScope.previousState = from;
                    $scope.backButtonToggle = (to.name === 'projects.details') ? true : false;
                    
                });
            }]
        };
    }])
;
