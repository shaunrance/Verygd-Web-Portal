/* global angular */
angular.module('ua5App')
    .factory('UsersResource', ['$resource', 'APICONSTANTS', function($resource, APICONSTANTS) {
        return {
            users: function() {
                return $resource(APICONSTANTS.apiHost + '/users', {},
                    {
                        retrieve: {method: 'GET', isArray: true},
                        create: {method:'POST'}
                    }
                );
            },
            user: function() {
                return $resource(APICONSTANTS.apiHost + '/users/:id', {id:'@userId'},
                    {
                        retrieve: {method: 'GET'},
                        update: {method: 'PUT', params: {id:'@id'}},
                        remove: {method: 'DELETE'}
                    }
                );
            },
            signup: function() {
                return $resource(APICONSTANTS.apiHost + '/users/signup', {},
                    {
                        create: {method:'POST'}
                    }
                );
            }
        };
    }])
;
