/* global angular, _ */
angular.module('ua5App')
    .controller('linkModalController', ['$scope', '$element', 'fields', 'close', 'screenFactory', function($scope, $element, fields, close, screenFactory) {
        var i;
        $scope.title = fields.title;
        $scope.formLabels = fields.formLabels;
        $scope.buttonTextLink = fields.submitButtonTextLink;
        $scope.buttonTextCancel = fields.submitButtonTextCancel;
        $scope.input = {
            fields: {
                name: '',
                description: ''
            }
        };

        $scope.selectedScene = parseInt(fields.content.related_tag, 10);
        $scope.showFileUpload = fields.showFileUpload;
        $scope.scenes = fields.scenes;
        i = $scope.scenes;
        $scope.thumbs = [];

        while (i--) {
            $scope.thumbs[i] = _.find(fields.allScreens, {tag: (i + 1).toString()});
        }
        $scope.save = function() {
            fields.content.related_tag = $scope.selectedScene;
            screenFactory.editScreen(fields.content.id, {related_tag: $scope.selectedScene});
            close({
                input: $scope.input.fields
            });
        };

        $scope.cancel = function() {
            close({
                input: $scope.input.fields
            });
        };

        $scope.getScene = function(num) {
            return new Array(num);
        };

        $scope.selectScreen = function(screen) {
            if (screen === $scope.selectedScene) {
                $scope.selectedScene = null;
            } else {
                $scope.selectedScene = screen;    
            }
        };
    }])
;
