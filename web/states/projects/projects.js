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
    .controller('projectsCtrl', ['$scope', 'projectFactory', function($scope, projectFactory) {
        $scope.newProjects = {};

        $scope.createProject = function() {
            projectFactory.addProject($scope.newProjects)
                .then(function(response) {
                   
                }, function(error) {
                  
                });
        };

        function getProjects() {
            projectFactory.getProjects()

                .then(function(response) {
                    var grabProject = response.data[1];
                    $scope.projects = grabProject;
                    
                }, function(error) {
                    
                });
        }

        getProjects();
    }]);
