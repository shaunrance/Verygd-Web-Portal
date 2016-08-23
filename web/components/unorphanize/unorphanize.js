/* global angular, _, $ */
angular.module('ua5App')
    .directive('unorphanize', [function() {
        return {
            restrict: 'A',
            scope: {
                unorphanize: '@'
            },
            link: function($scope, element, attrs) {
                var n;
                n = parseInt($scope.unorphanize, 10) || 1;
                _.defer(function() {
                    $(element).unorphanize(n);
                });
            }
        };
    }])
;
