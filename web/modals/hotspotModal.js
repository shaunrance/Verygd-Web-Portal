/* global angular */
angular.module('ua5App')
    .controller('hotspotController', ['$scope', '$element', 'content', 'close', 'panelFactory', 'scenes', function($scope, $element, content, close, panelFactory, scenes) {
        console.log(content.hotspots);
        //content.hotspots = JSON.parse(content.hotspots);
        if (content.hotspots === null) {
            content.hotspots = [];
        }
        $scope.content = content;
        $scope.current = {index: -1};
        $scope.content = content;
        $scope.scenes = scenes;

        $scope.close = function() {
            close();
        };

        // $scope.cancel = function() {
        //     close();
        // };
        $scope.$on('hotspot:new', function(event, data) {
            $scope.current = data;
        });

        $scope.$on('hotspot:edit', function(event, data) {
            if ($scope.current.index !== -1 && $scope.current.index !== data.index) {
                $scope.$broadcast('hotspot:reset', $scope.current);
            }
            $scope.current = data;
        });

        $scope.cancel = function() {
            $scope.$broadcast('hotspot:reset', $scope.current);
            $scope.$broadcast('hotspot:cleanup');
            $scope.current = {index: -1};
        };

        $scope.save = function() {
            $scope.content.hotspots[$scope.current.index] = $scope.current;
            panelFactory.editPanel($scope.content.id, {hotspots: $scope.content.hotspots}).then(function() {
                $scope.cancel();
            });
        };

        $scope.remove = function() {
            $scope.content.hotspots.splice($scope.current.index, 1);
            panelFactory.editPanel($scope.content.id, {hotspots: $scope.content.hotspots});
            $scope.cancel();
        };
    }])
;
