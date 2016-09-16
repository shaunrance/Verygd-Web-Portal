/* global angular */
angular.module('ua5App.details')
    .factory('screenFactory', ['$http', 'Upload', function($http, Upload) {
        var urlBase = 'http://216.70.115.196:7777/album';
        var dataFactory = {};

        dataFactory.getScreens = function(projectId) {
            return $http.get(urlBase + '/' + projectId, {
                headers: {Authorization: 'Token 99fa9507df915b6164537069e3d2b61af92882a3'}
            });
        };

        dataFactory.insertScreen = function(file, projectId) {
            return Upload.upload({
                headers: {
                    Authorization: 'Token 99fa9507df915b6164537069e3d2b61af92882a3'
                },
                url:'http://216.70.115.196:7777/images',
                data: {title: 'name', description: 'description', album: projectId, content: file}
            });
        };

        dataFactory.deleteScreen = function(id) {
            return $http.delete('http://216.70.115.196:7777/images/' + id, { // jshint ignore:line
                headers: {Authorization: 'Token 99fa9507df915b6164537069e3d2b61af92882a3'}
            });
        };

        return dataFactory;

    }])
;