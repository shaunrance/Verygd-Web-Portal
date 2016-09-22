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
        var addProject = function(project) {
            projectFactory.addProject(project)

            .then(function(response) {
                getProjects();
            }, function(error) {
                  
            });
        };

        $scope.newProject = {};

        $scope.$on('addProject', function(event, args) {
            addProject(args);
        });

        $scope.deleteProject = function(projectId) {
            projectFactory.deleteScreen(projectId)
            
            .then(function(response) {
                    getProjects();
                }, function(error) {
                    $scope.status = 'Unable to delete project: ' + error.message;
                });
        };

        function getProjects() {
            projectFactory.getProjects()

                .then(function(response) {
                    $scope.projects = response.data;
                    
                }, function(error) {
                    
                });
        }

        getProjects();
    }]);
