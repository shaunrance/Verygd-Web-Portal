/* global angular */
angular.module('ua5App')
	.controller('shareModalController', ['$scope', '$element', 'fields', 'close', function($scope, $element, fields, close) {
        $scope.title = fields.title;
        $scope.formLabels = fields.formLabels;
        $scope.buttonText = fields.submitButtonText;
        $scope.input = {
            fields: {
                name: '',
                description: ''
            }
        };
        $scope.showFileUpload = fields.showFileUpload;
        $scope.url = window.location.href.replace('projects', 'scene');
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