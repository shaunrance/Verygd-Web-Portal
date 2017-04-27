/* global angular, $ */
angular.module('ua5App')
	.controller('sceneInstructModal', ['$scope', '$element', 'fields', 'close', function($scope, $element, fields, close) {
        $scope.buttonText = fields.submitButtonText;
        $scope.currentPanel = 1;
        $scope.input = {
            fields: {
                panels: fields.panels
            }
        };

        $scope.nextPanel = function() {
            if ($scope.currentPanel === 1) {
                $scope.currentPanel = 2;
                $('.panel-1').hide();
                $('.panel-2').show();
                $('.icon-1').removeClass('active');
                $('.icon-2').addClass('active');
            } else if ($scope.currentPanel >= 2) {
                $scope.cancel();
            }
        };

        $scope.changePanel = function(panel) {
            if (panel === 1) {
                $scope.currentPanel = 1;
                $('.panel-1').show();
                $('.panel-2').hide();
                $('.icon-1').addClass('active');
                $('.icon-2').removeClass('active');
            } else if (panel === 2) {
                $scope.currentPanel = 2;
                $('.panel-1').hide();
                $('.panel-2').show();
                $('.icon-1').removeClass('active');
                $('.icon-2').addClass('active');
            }
        };

        $scope.cancel = function() {
            close({
                input: $scope.input.fields
            });
        };
    }])
;
