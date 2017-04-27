/* global angular */
angular.module('ua5App')
    .factory('sceneFactory', ['$http', 'Upload', 'APICONSTANTS', function($http, Upload, APICONSTANTS) {
        var urlBase = APICONSTANTS.apiHost + '/scene';
        var dataFactory = {};

        dataFactory.getScenes = function(projectId) {
            return $http.get(urlBase, {});
        };

        dataFactory.getSceneById = function(sceneId) {
            return $http.get(urlBase + '/' + sceneId, {});
        };

        dataFactory.addScene = function(newScene, projectId) {
            var data = {
                project: projectId,
                title: newScene.name,
                description: newScene.description,
                background: '#000000',
                is_panorama: false
            };

            return $http.post(urlBase, data);
        };

        dataFactory.editScene = function(sceneId, data) {
            return Upload.upload({
                url: urlBase + '/' + sceneId,
                method: 'PUT',
                data: data
            });
        };

        dataFactory.deleteScene = function(projectId, sceneId) {
            return $http.delete(urlBase  + '/' + projectId, {}); // jshint ignore:line
        };

        return dataFactory;

    }])
;
