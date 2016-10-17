/* global angular */
angular.module('ua5App')
	.controller('billingModalController', ['$scope', '$element', 'fields', 'close', function($scope, $element, fields, close) {
        $scope.title = 'Professional Plan';
        $scope.currentPlan = '$25.00/mo';
        $scope.formLabels = 'dfdsf';
        $scope.price = '$' + 25;
        $scope.buttonText = 'Charge my card ' + $scope.price + ' right now';
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
            console.log('dsjhg');
            close({
                input: $scope.input.fields
            });
        };
    }])
;
