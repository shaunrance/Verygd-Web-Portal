/* global angular, _ */
angular.module('ua5App')
    .controller('linkModalController', ['$scope', '$element', 'fields', 'close', 'panelFactory', function($scope, $element, fields, close, panelFactory) {
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

        $scope.panel = fields.content;
        $scope.showFileUpload = fields.showFileUpload;
        $scope.scenes = fields.scenes;

        _.each($scope.scenes, function(scene) {
            if (scene.title === $scope.panel.related_tag) {
                $scope.selectedScene = scene.title;
            }
        });

        $scope.save = function() {
            fields.content.related_tag = $scope.selectedScene;
            panelFactory.editPanel(fields.content.id, {related_tag: $scope.selectedScene});

            close({
                input: $scope.input.fields
            });
        };

        $scope.cancel = function() {
            close({
                input: $scope.input.fields
            });
        };

        $scope.selectScene = function(scene) {
            if (scene === $scope.selectedScene) {
                $scope.selectedScene = null;
            } else {
                $scope.selectedScene = scene;
            }
        };
    }])
;
