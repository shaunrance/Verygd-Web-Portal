/* global angular */
angular.module('ua5App')
	.controller('projectInstructModal', ['$scope', '$element', 'fields', 'close', function($scope, $element, fields, close) {
        $scope.buttonText = fields.submitButtonText;
        $scope.input = {
            fields: {
                modules: fields.modules,
                texts: fields.texts
            }
        };

        $scope.close = function() {
            close({
                input: $scope.input.fields
            });
        };
        $scope.cancel = function() {
            close({
                input: $scope.input.fields
            });
        };
    }])
;
