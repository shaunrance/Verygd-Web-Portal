/* global angular */
angular.module('ua5App')
    .factory('screenFactory', ['$http', 'Upload', function($http, Upload) {
        var urlBase = 'http://216.70.115.196:7777/album';
        var dataFactory = {};

        $http.defaults.headers.common['Authorization'] = 'Token a9ab45f1306ad8a2e357040998a0cc5ea90e2ab4'; // jshint ignore:line

        dataFactory.getScreens = function(projectId) {
            return $http.get(urlBase + '/' + projectId);
        };

        dataFactory.insertScreen = function(file, projectId, scene, order) {
            return Upload.upload({
                url:'http://216.70.115.196:7777/images',
                data: {title: 'name', order: order, description: 'description', tag: scene, album: projectId, content: file}
            });
        };

        dataFactory.deleteScreen = function(id) {
            return $http.delete('http://216.70.115.196:7777/images/' + id); // jshint ignore:line
        };

        dataFactory.editScreen = function(id, data) {
            return $http.put('http://216.70.115.196:7777/images/' + id, { // jshint ignore:line
                order: data.order
            });
        };

        return dataFactory;

    }])
;