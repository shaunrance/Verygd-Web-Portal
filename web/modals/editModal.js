/* global angular */
angular.module('ua5App')
	.controller('editModalController', ['$scope', '$element', 'fields', 'close', function($scope, $element, fields, close) {
        $scope.title = fields.title;
        $scope.formLabels = fields.formLabels;
        $scope.buttonText = fields.submitButtonText;
        $scope.input = {
            fields: {
                name: $scope.formLabels[0].title,
                description: ''
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
