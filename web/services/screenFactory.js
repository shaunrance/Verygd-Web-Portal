/* global angular */
angular.module('ua5App')
    .factory('screenFactory', ['$http', 'Upload', function($http, Upload) {
        var urlBase = 'http://216.70.115.196:7777/album';
        var dataFactory = {};

        dataFactory.getScreens = function(projectId) {
            return $http.get(urlBase + '/' + projectId, {
                headers: {Authorization: 'Token a9ab45f1306ad8a2e357040998a0cc5ea90e2ab4'}
            });
        };

        dataFactory.insertScreen = function(file, projectId, scene) {
            return Upload.upload({
                headers: {
                    Authorization: 'Token a9ab45f1306ad8a2e357040998a0cc5ea90e2ab4'
                },
                url:'http://216.70.115.196:7777/images',
                data: {title: 'name', order: 1, description: 'description', tag: scene, album: projectId, content: file}
            });
        };

        dataFactory.deleteScreen = function(id) {
            return $http.delete('http://216.70.115.196:7777/images/' + id, { // jshint ignore:line
                headers: {Authorization: 'Token a9ab45f1306ad8a2e357040998a0cc5ea90e2ab4'}
            });
        };

        dataFactory.editScreen = function(id, data) {
            return $http.put('http://216.70.115.196:7777/images/' + id, { // jshint ignore:line
                headers: {Authorization: 'Token a9ab45f1306ad8a2e357040998a0cc5ea90e2ab4'},
                data: data
            });
        };

        return dataFactory;

    }])
;