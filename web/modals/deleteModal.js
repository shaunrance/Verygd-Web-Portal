/* global angular */
angular.module('ua5App')
	.controller('deleteModalController', ['$scope', '$element', 'fields', 'close', function($scope, $element, fields, close) {
        $scope.title = fields.title;
        $scope.confirmText = fields.confirmText;
        $scope.buttonText = fields.submitButtonText;
        
        $scope.close = function(result) {
            close(result);
        };
    }])
;