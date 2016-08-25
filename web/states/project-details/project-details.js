/* global angular */
angular.module('ua5App.project-details')
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $stateProvider.state('project-details', {
            url: '/project-details',
            templateUrl: 'states/project-details/project-details.html',
            controller: 'projectDetailsCtrl',
            controllerAs: 'ctrl'
        });
    }])
    .controller('projectDetailsCtrl', [function() {}])
;
