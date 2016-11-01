/* global angular */
angular.module('ua5App')
    .factory('projectFactory', ['$http', 'Upload', '$q', function($http, Upload, $q) {
        var urlBase = 'http://52.53.186.20/project';
        var pubUrlBase = 'http://52.53.186.20/public/project';
        var dataFactory = {};

        dataFactory.getProjects = function() {
            return $http.get(urlBase, {
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
                url: urlBase,
                data: {name: newProject.name, description: newProject.description, public: newProject.isPublic} // jshint ignore:line
            });
        };

        dataFactory.editProject = function(projectId, data) {
            return $http.put(urlBase + '/' + projectId, data);
        };

        dataFactory.deleteScreen = function(id) {
            return $http.delete(urlBase + '/' + id); // jshint ignore:line
        };

        return dataFactory;

    }])
;
