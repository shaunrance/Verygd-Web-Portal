/* global angular */
angular.module('ua5App')
    .factory('sceneFactory', ['$http', 'Upload', function($http, Upload) {
        var urlBase = 'http://52.53.186.20/project';
        var dataFactory = {};

        dataFactory.getScenes = function(projectId) {
            return $http.get(urlBase + '/scene', {
                // headers: {Authorization: 'Token a9ab45f1306ad8a2e357040998a0cc5ea90e2ab4'}
            });
        };

        dataFactory.getSceneById = function(projectId, sceneId) {
            return $http.get(urlBase + '/scene/' + sceneId, {
                headers: {Authorization: 'Token a9ab45f1306ad8a2e357040998a0cc5ea90e2ab4'}
            });
        };

        dataFactory.addScene = function(newScene) {
            var data = {
                title: newScene.name,
                description: newScene.description,
                patient: 1
            };

            return $http.post('http://52.53.186.20/scene', data);
            // return Upload.upload({
            //     // headers: {
            //     //     Authorization: 'Token a9ab45f1306ad8a2e357040998a0cc5ea90e2ab4'
            //     // },
            //     url: 'http://52.53.186.20/album/scene',
            //     data: {}
            // });
        };

        dataFactory.deleteScene = function(projectId, sceneId) {
            return $http.delete(urlBase + '/scene/' + sceneId, { // jshint ignore:line
                // headers: {Authorization: 'Token a9ab45f1306ad8a2e357040998a0cc5ea90e2ab4'}
            });
        };

        return dataFactory;

    }])
;
