/* global angular */
angular.module('ua5App')
    .factory('contentFactory', ['$http', 'Upload', function($http, Upload) {
        var urlBase = 'http://52.53.186.20/album';
        var dataFactory = {};

        dataFactory.getContent = function() {
            return $http.get(urlBase, {
                // headers: {Authorization: 'Token a9ab45f1306ad8a2e357040998a0cc5ea90e2ab4'}
            });
        };

        dataFactory.addContent = function(newContent) {
            return Upload.upload({
                // headers: {
                //     Authorization: 'Token a9ab45f1306ad8a2e357040998a0cc5ea90e2ab4'
                // },
                url: urlBase,
                data: {title: newContent.name, description: newContent.description, patient: 1}
            });
        };

        dataFactory.deleteScreen = function(id) {
            return $http.delete(urlBase + '/' + id, { // jshint ignore:line
                // headers: {Authorization: 'Token a9ab45f1306ad8a2e357040998a0cc5ea90e2ab4'}
            });
        };

        return dataFactory;

    }])
;
