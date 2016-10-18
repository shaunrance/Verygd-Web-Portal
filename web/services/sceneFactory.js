/* global angular */
angular.module('ua5App')
    .factory('sceneFactory', ['$http', 'Upload', function($http, Upload) {
        var urlBase = 'http://52.53.186.20/album';
        var dataFactory = {};

        dataFactory.getScenes = function(projectId) {
            return $http.get(urlBase + '/' + projectId, {
                // headers: {Authorization: 'Token a9ab45f1306ad8a2e357040998a0cc5ea90e2ab4'}
            });
        };

        dataFactory.getSceneById = function(projectId, sceneId) {
            return $http.get(urlBase + '/' + projectId + '/' + sceneId, {
                headers: {Authorization: 'Token a9ab45f1306ad8a2e357040998a0cc5ea90e2ab4'}
            });
        };

        dataFactory.addScene = function(newScene, projectId) {
            return Upload.upload({
                url: urlBase + '/' + projectId,
                data: {title: newScene.name, patient: 1}
            });
        };

        dataFactory.deleteScene = function(projectId, sceneId) {
            return $http.delete(urlBase + '/' + projectId + '/' + sceneId, { // jshint ignore:line
                // headers: {Authorization: 'Token a9ab45f1306ad8a2e357040998a0cc5ea90e2ab4'}
            });
        };

        return dataFactory;

    }])
;
