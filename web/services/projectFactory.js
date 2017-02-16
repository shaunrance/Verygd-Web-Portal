/* global angular */
angular.module('ua5App')
    .factory('projectFactory', ['$http', 'Upload', '$q', 'APICONSTANTS', function($http, Upload, $q, APICONSTANTS) {
        var urlBase = APICONSTANTS.apiHost + '/project';
        var pubUrlBase = APICONSTANTS.apiHost + '/public/project';
        var dataFactory = {};

        dataFactory.getProjects = function() {
            return $http.get(urlBase, {
            });
        };

        dataFactory.getProjectById = function(projectId) {
            return $http.get(urlBase + '/' + projectId, {});
        };

        dataFactory.getProjectByPubId = function(projectId) {
            return $http.get(pubUrlBase + '/' + projectId, {isPublic: true});
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
