/* global angular */
angular.module('ua5App.hotspots')
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $stateProvider.state('hotspots', {
            url: '/hotspots/{panelId}',
            templateUrl: 'states/hotspots/hotspots.html',
            controller: 'hotspotsCtrl',
            controllerAs: 'ctrl',
            resolve: {
                content: ['panelFactory', '$stateParams', function(panelFactory, $stateParams) {
                    return panelFactory.getPanel($stateParams.panelId);
                }]
            }
        });
    }])
    .controller('hotspotsCtrl', ['content', '$scope', function(content, $scope) {
        content.data.hotspots = [
            {
                id: 1,
                x: 0.34,
                y: 0.45,
                width: 0.30,
                height: 0.20,
                linked_scene_id: 342,
                saved: true
            },
            {
                id: 2,
                x: 0.54,
                y: 0.0,
                width: 0.40,
                height: 0.25,
                linked_scene_id: 341,
                saved: true
            }
        ];
        $scope.content = content.data;
        console.log($scope.content);

    }])
;
