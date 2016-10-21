/* global angular */
angular.module('ua5App')
    .factory('sceneFactory', ['$http', 'Upload', function($http, Upload) {
        var urlBase = 'http://52.53.186.20/scene';
        var dataFactory = {};

        dataFactory.getScenes = function(projectId) {
            return $http.get(urlBase, {
                headers: {Authorization: 'Token a9ab45f1306ad8a2e357040998a0cc5ea90e2ab4'}
            });
        };

        dataFactory.getSceneById = function(sceneId) {
            return $http.get(urlBase + '/' + sceneId, {
                headers: {Authorization: 'Token a9ab45f1306ad8a2e357040998a0cc5ea90e2ab4'}
            });
        };

        dataFactory.addScene = function(newScene, projectId) {
            var data = {
                project: projectId,
                title: newScene.name,
                description: newScene.description,
                background: '#000000',
                is_panorama: true
            };

            return $http.post('http://52.53.186.20/scene', data);
        };

        dataFactory.deleteScene = function(projectId, sceneId) {
            return $http.delete(urlBase  + '/' + projectId, { // jshint ignore:line
                // headers: {Authorization: 'Token a9ab45f1306ad8a2e357040998a0cc5ea90e2ab4'}
            });
        };

        return dataFactory;

    }])
;
