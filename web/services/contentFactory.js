/* global angular */
angular.module('ua5App')
    .factory('contentFactory', ['$http', 'Upload', 'APICONSTANTS', function($http, Upload, APICONSTANTS) {
        var urlBase = APICONSTANTS.apiHost + '/album';
        var dataFactory = {};

        dataFactory.getContent = function() {
            return $http.get(urlBase, {});
        };

        dataFactory.addContent = function(newContent) {
            return Upload.upload({
                url: urlBase,
                data: {title: newContent.name, description: newContent.description}
            });
        };

        dataFactory.deleteScreen = function(id) {
            return $http.delete(urlBase + '/' + id, {}); // jshint ignore:line
        };

        return dataFactory;

    }])
;
