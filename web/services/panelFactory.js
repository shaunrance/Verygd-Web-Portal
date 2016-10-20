/* global angular */
angular.module('ua5App')
    .factory('panelFactory', ['$http', 'Upload', function($http, Upload) {
        var urlBase = 'http://52.53.186.20/panel';
        var dataFactory = {};

        // $http.defaults.headers.common['Authorization'] = 'Token a9ab45f1306ad8a2e357040998a0cc5ea90e2ab4'; // jshint ignore:line

        dataFactory.getPanels = function(projectId) {
            return $http.get(urlBase + '/' + projectId);
        };

        dataFactory.insertPanel = function(file, sceneId, order) {
            var fileName = file.name;
            return Upload.upload({
                url:'http://52.53.186.20/panel',
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
            return $http.delete('http://52.53.186.20/panel/' + id); // jshint ignore:line
        };

        dataFactory.editPanel = function(id, data) {
            return $http.put('http://52.53.186.20/panel/' + id, data); // jshint ignore:line
        };

        return dataFactory;

    }])
;
