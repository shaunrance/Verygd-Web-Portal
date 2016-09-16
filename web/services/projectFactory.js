/* global angular */
angular.module('ua5App.projects')
    .factory('projectFactory', ['$http', 'Upload', function($http, Upload) {
        var urlBase = 'http://216.70.115.196:7777/album/';
        var dataFactory = {};

        dataFactory.getProjects = function() {
            return $http.get(urlBase, {
                headers: {Authorization: 'Token 99fa9507df915b6164537069e3d2b61af92882a3'}
            });
        };

        return dataFactory;

    }])
;