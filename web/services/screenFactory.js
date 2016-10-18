/* global angular */
angular.module('ua5App')
    .factory('screenFactory', ['$http', 'Upload', function($http, Upload) {
        var urlBase = 'http://52.53.186.20/album';
        var dataFactory = {};

        // $http.defaults.headers.common['Authorization'] = 'Token a9ab45f1306ad8a2e357040998a0cc5ea90e2ab4'; // jshint ignore:line

        dataFactory.getScreens = function(projectId) {
            return $http.get(urlBase + '/' + projectId);
        };

        dataFactory.insertScreen = function(file, projectId, scene, order) {
            var fileName = file.name;
            return Upload.upload({
                url:'http://52.53.186.20/images',
                data: {title: fileName, order: order, description: 'description', tag: scene, album: projectId, content: file}
            });
        };

        dataFactory.deleteScreen = function(id) {
            return $http.delete('http://52.53.186.20/images/' + id); // jshint ignore:line
        };

        dataFactory.editScreen = function(id, data) {
            return $http.put('http://52.53.186.20/images/' + id, data); // jshint ignore:line
        };

        return dataFactory;

    }])
;
