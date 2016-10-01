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
                    } else {
                        $state.go('projects');
                    }
                    
                };
                $rootScope.$on('$stateChangeSuccess', function(event, to, toParams, from, fromParams) {
                    $rootScope.previousState = from;
                });
            }]
        };
    }])
;
