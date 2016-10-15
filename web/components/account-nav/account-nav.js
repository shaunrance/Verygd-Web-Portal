/* global angular */
angular.module('ua5App')
    .directive('accountNav', [function() {
        return {
            restrict: 'A',
            templateUrl: 'components/account-nav/account-nav.html',
            link: function($scope, element, attrs) {}
        };
    }])
;
