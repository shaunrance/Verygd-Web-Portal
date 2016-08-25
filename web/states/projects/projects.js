/* global angular */
angular.module('ua5App.projects')
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $stateProvider.state('projects', {
            url: '/projects',
            templateUrl: 'states/projects/projects.html',
            controller: 'projectsCtrl',
            controllerAs: 'ctrl'
        });
    }])
    .controller('projectsCtrl', [function() {}])
;
