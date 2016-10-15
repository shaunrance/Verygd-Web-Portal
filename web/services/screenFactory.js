/* global angular */
angular.module('ua5App')
    .factory('screenFactory', ['$http', 'Upload', function($http, Upload) {
        var urlBase = 'http://ec2-52-53-186-20.us-west-1.compute.amazonaws.com/album';
        var dataFactory = {};

        // $http.defaults.headers.common['Authorization'] = 'Token a9ab45f1306ad8a2e357040998a0cc5ea90e2ab4'; // jshint ignore:line

        dataFactory.getScreens = function(projectId) {
            return $http.get(urlBase + '/' + projectId);
        };

        dataFactory.insertScreen = function(file, projectId, scene, order) {
            return Upload.upload({
                url:'http://ec2-52-53-186-20.us-west-1.compute.amazonaws.com/images',
                data: {title: 'name', order: order, description: 'description', tag: scene, album: projectId, content: file}
            });
        };

        dataFactory.deleteScreen = function(id) {
            return $http.delete('http://ec2-52-53-186-20.us-west-1.compute.amazonaws.com/images/' + id); // jshint ignore:line
        };

        dataFactory.editScreen = function(id, data) {
            return $http.put('http://ec2-52-53-186-20.us-west-1.compute.amazonaws.com/images/' + id, data); // jshint ignore:line
        };

        return dataFactory;

    }])
;
