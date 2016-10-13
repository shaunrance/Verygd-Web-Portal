/* global angular */
angular.module('ua5App')
    .directive('toggleSwitch', function() {
        return {
            restrict: 'EA',
            replace: true,
            require: 'ngModel',
            scope: {
                disabled: '@',
                color: '@'
            },
            templateUrl:'components/toggle-switch/toggle-switch.html',
            compile: function(element, attrs) {
                return this.link;
            },
            link: function(scope, element, attrs, ngModelCtrl) {
                element.on('click', function() {
                    scope.$apply(scope.toggle);
                });

                ngModelCtrl.$formatters.push(function(modelValue) {
                    return modelValue;
                });

                ngModelCtrl.$parsers.push(function(viewValue) {
                    return viewValue;
                });

                ngModelCtrl.$viewChangeListeners.push(function() {
                    scope.$eval(attrs.ngChange);
                });

                ngModelCtrl.$render = function() {
                    scope.model = ngModelCtrl.$viewValue;
                };

                scope.toggle = function toggle() {
                    if (!scope.disabled) {
                        scope.model = !scope.model;
                        console.log(scope.model);
                        ngModelCtrl.$setViewValue(scope.model);
                    }
                };
            }
        };
    });
