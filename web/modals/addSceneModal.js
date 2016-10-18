/* global angular */
angular.module('ua5App')
    .controller('addSceneModalController', ['$scope', '$element', '$rootScope', 'fields', 'close', 'screenFactory', function($scope, $element, $rootScope, fields, close, screenFactory) {
        $scope.title = fields.title;
        $scope.formLabels = fields.formLabels;
        $scope.buttonTextLink = fields.submitButtonTextLink;
        $scope.buttonTextCancel = fields.submitButtonTextCancel;
        $scope.input = {
            fields: {
                name: fields.name
            }
        };

        $scope.scenes = fields.scenes;

        $scope.save = function() {
            var name = $scope.input.fields.name;
            $rootScope.$broadcast('modal:add-scene', {name: name});
            //screenFactory.editScreen(fields.content.id, {related_tag: $scope.selectedScene});
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
