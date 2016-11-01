/* global angular */
angular.module('ua5App')
    .factory('projectFactory', ['$http', 'Upload', function($http, Upload) {
        var urlBase = 'http://52.53.186.20/project';
        var pubUrlBase = 'http://52.53.186.20/public/project';
        var dataFactory = {};

        dataFactory.getProjects = function() {
            return $http.get(urlBase, {
                headers: {Authorization: 'Token a9ab45f1306ad8a2e357040998a0cc5ea90e2ab4'}
            });
        };

        dataFactory.getProjectById = function(projectId) {
            return $http.get(urlBase + '/' + projectId, {});
        };

        dataFactory.getProjectByPubId = function(projectId) {
            return $http.get(pubUrlBase + '/' + projectId, {});
        };

        dataFactory.addProject = function(newProject) {
            return Upload.upload({
                headers: {
                    Authorization: 'Token a9ab45f1306ad8a2e357040998a0cc5ea90e2ab4'
                },
                url: urlBase,
                data: {name: newProject.name, description: newProject.description, patient: 1}
            });
        };

        dataFactory.editProject = function(projectId, data) {
            return $http.put(urlBase + '/' + projectId, data);
        };

        dataFactory.deleteScreen = function(id) {
            return $http.delete(urlBase + '/' + id, { // jshint ignore:line
                // headers: {Authorization: 'Token a9ab45f1306ad8a2e357040998a0cc5ea90e2ab4'}
            });
        };

        return dataFactory;

    }])
;
