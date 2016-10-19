/* global angular, _ */
angular.module('ua5App.scene')
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $stateProvider.state('scene', {
            url: '/scene/:projectId',
            templateUrl: 'states/scene/scene.html',
            controller: 'sceneCtrl',
            controllerAs: 'ctrl',
            resolve: {
                content: ['panelFactory', '$stateParams', function(panelFactory, $stateParams) {
                    return panelFactory.getScreens($stateParams.projectId).then(function(response) {
                        return response;
                    });
                }]
            }
        });
    }])
    .controller('sceneCtrl', ['$scope', 'content', '$stateParams', function($scope, content, $stateParams) {
        $scope.content = content.data.content;
        $scope.scene = '1';
        $scope.projectId = $stateParams.projectId;
        $scope.currentSceneScreens = _.where($scope.content, {tag: $scope.scene.toString()});
    }])
;
