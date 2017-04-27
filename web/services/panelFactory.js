/* global angular */
angular.module('ua5App')
    .factory('panelFactory', ['$http', 'Upload', 'APICONSTANTS', function($http, Upload, APICONSTANTS) {
        var urlBase = APICONSTANTS.apiHost + '/panel';
        var dataFactory = {};

        // $http.defaults.headers.common['Authorization'] = 'Token a9ab45f1306ad8a2e357040998a0cc5ea90e2ab4'; // jshint ignore:line

        dataFactory.getPanels = function(projectId) {
            return $http.get(urlBase + '/' + projectId);
        };

        dataFactory.getPanel = function(panelId) {
            return $http.get(urlBase + '/' + panelId);
        };

        dataFactory.insertPanel = function(file, sceneId, order) {
            var fileName = file.name;
            return Upload.upload({
                url: urlBase,
                data: {
                    title: fileName,
                    order: order,
                    description: 'description',
                    content: file,
                    scene: sceneId
                }
            });
        };

        dataFactory.deletePanel = function(id) {
            return $http.delete(urlBase + '/' + id); // jshint ignore:line
        };

        dataFactory.editPanel = function(id, data) {
            return $http.put(urlBase + '/' + id, data); // jshint ignore:line
        };

        return dataFactory;

    }])
;
