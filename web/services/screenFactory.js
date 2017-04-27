/* global angular */
angular.module('ua5App')
    .factory('screenFactory', ['$http', 'Upload', 'APICONSTANTS', function($http, Upload, APICONSTANTS) {
        var dataFactory = {};

        dataFactory.getScreens = function(projectId) {
            return $http.get(APICONSTANTS.apiHost + '/album/' + projectId);
        };

        dataFactory.insertScreen = function(file, projectId, scene, order) {
            return Upload.upload({
                url: APICONSTANTS.apiHost + '/images',
                data: {title: 'name', order: order, description: 'description', tag: scene, album: projectId, content: file}
            });
        };

        dataFactory.deleteScreen = function(id) {
            return $http.delete(APICONSTANTS.apiHost + '/images/' + id); // jshint ignore:line
        };

        dataFactory.editScreen = function(id, data) {
            return $http.put(APICONSTANTS.apiHost + '/images/' + id, data); // jshint ignore:line
        };

        return dataFactory;

    }])
;
