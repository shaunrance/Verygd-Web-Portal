/* global angular */
angular.module('ua5App.details')
    .factory('screenFactory', ['$http', 'Upload', function($http, Upload) {
        var urlBase = 'http://216.70.115.196:8080/album/78';
        var dataFactory = {};

        dataFactory.getScreens = function() {
            return $http.get(urlBase, {
                headers: {Authorization: 'Token 99fa9507df915b6164537069e3d2b61af92882a3'}
            });
        };

        dataFactory.insertScreen = function(file) {
            return Upload.upload({
                headers: {
                    Authorization: 'Token 99fa9507df915b6164537069e3d2b61af92882a3'
                },
                url:'http://216.70.115.196:8080/images',
                data: {title: 'name', description: 'description', album: '78', content: file}
            });
        };

        dataFactory.deleteScreen = function(filename) {
            return $http.delete(filename); // jshint ignore:line
        };

        return dataFactory;

    }])
;