/* global angular */
angular.module('ua5App')
	.controller('addModalController', ['$scope', '$element', 'fields', 'close', function($scope, $element, fields, close) {
        $scope.title = fields.title;
        $scope.formLabels = fields.formLabels;
        $scope.input = {
            fields: {
                name: '',
                description: ''
            }
        };
        $scope.showFileUpload = fields.showFileUpload;
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