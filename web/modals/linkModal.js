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
            var sceneImage = scene.content.length > 0 ? scene.content[0].url : '/assets/img/image-placeholder.jpg';

            if (scene.id === parseInt($scope.panel.related_tag, 10)) {
                $scope.selectedScene = scene.id;
            }

            scene.thumb = sceneImage + '?fm=jpg&q=60&h=200&w=200&fit=max&bg=000000';
        });

        $scope.save = function() {
            fields.content.related_tag = $scope.selectedScene;
            panelFactory.editPanel(fields.content.id, {related_tag: $scope.selectedScene})
                .then(function() {
                    close({
                        input: $scope.input.fields
                    });
                });
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

        $scope.selectScene = function(scene) {
            if (scene === $scope.selectedScene) {
                $scope.selectedScene = null;
            } else {
                $scope.selectedScene = scene;
            }
        };
    }])
;
