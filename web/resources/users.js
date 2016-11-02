/* global angular */
angular.module('ua5App')
    .factory('UsersResource', ['$resource', '$q', 'APICONSTANTS', function($resource, $q, APICONSTANTS) {
        var d;
        var initialized;
        d = $q.defer();

        return {
            get: function() {
                if (!initialized) {
                    initialized = true;
                    $resource(APICONSTANTS.apiHost + '/users/:id', {id:'@userId'},
                        {
                            retrieve: {method: 'GET', isArray: true}
                        }
                    ).retrieve(function(user) {
                        d.resolve(user);
                    });
                }
                return d.promise;
            },
            resetUser: function() {
                initialized = false;
                d = $q.defer();
            },
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
            update: function() {
                return $resource(APICONSTANTS.apiHost + '/users/:id', {id: '@userId'},
                    {
                        save: {method: 'PUT', params: {id: '@id'}}
                    }
                );
            },
            updatePass: function() {
                return $resource(APICONSTANTS.apiHost + '/users/:id/reset_password', {id: '@userId'},
                    {
                        save: {method: 'POST', params: {id: '@id'}}
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
