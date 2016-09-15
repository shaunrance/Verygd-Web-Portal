/* global angular */
angular.module('ua5App.projects')
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $stateProvider.state('projects', {
            name:'Projects',
            url: '/projects',
            templateUrl: 'states/projects/projects.html',
            controller: 'projectsCtrl',
            controllerAs: 'ctrl',
            data: {
                settings:{displayName:'My Projects'}
            }
        });
    }])
    .controller('projectsCtrl', ['$scope', function($scope) {}]);
