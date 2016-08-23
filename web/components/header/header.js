/* global angular */
angular.module('ua5App')
    .directive('header', [function() {
        return {
            restrict: 'A',
            templateUrl: 'components/header/header.html',
            link: function($scope, element, attrs) {}
        };
    }])
;
