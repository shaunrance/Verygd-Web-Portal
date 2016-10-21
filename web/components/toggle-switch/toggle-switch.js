/* global angular */
angular.module('ua5App')
    .directive('toggleSwitch', ['$rootScope', function($rootScope) {
        return {
            restrict: 'EA',
            replace: true,
            require: 'ngModel',
            scope: {
                disabled: '@',
                switched: '@',
                onLabel: '@',
                offLabel: '@',
                color: '@'
            },
            templateUrl:'components/toggle-switch/toggle-switch.html',
            compile: function(element, attrs) {
                return this.link;
            },
            link: function($scope, $element, $attrs, ngModelCtrl) {
                $scope.$watch('switched', function(value) {
                    if (value === 'true') {
                        $scope.model = true;
                    } else {
                        $scope.model = false;
                    }
                });

                $scope.$watch('model', function(value) {
                    if (value) {
                        $rootScope.$broadcast('toggle:on', $attrs.ngModel);
                    } else {
                        $rootScope.$broadcast('toggle:off', $attrs.ngModel);
                    }
                });

                $element.on('click', function() {
                    $scope.$apply($scope.toggle);
                });

                ngModelCtrl.$formatters.push(function(modelValue) {
                    return modelValue;
                });

                ngModelCtrl.$parsers.push(function(viewValue) {
                    return viewValue;
                });

                ngModelCtrl.$viewChangeListeners.push(function() {
                    $scope.$eval($attrs.ngChange);
                });

                ngModelCtrl.$render = function() {
                    $scope.model = ngModelCtrl.$viewValue;
                };

                $scope.toggle = function toggle() {
                    if ($scope.disabled !== 'true') {
                        $scope.model = !$scope.model;
                        ngModelCtrl.$setViewValue($scope.model);
                    }
                };
            }
        };
    }]);
