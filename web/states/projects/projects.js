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
        })
        .state('projects.details', {
            name:'Details',
            url: '/project-details',
            templateUrl: 'states/projects/projects.details.html',
            data: {
                settings:{displayName:'Project Name'}
            }    
        });
    }])
    .controller('projectsCtrl', ['$scope', function($scope) {}]);
