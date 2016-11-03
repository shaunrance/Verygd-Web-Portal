/* global angular, _ */
angular.module('ua5App')
    .factory('UsersResource', ['$resource', '$q', 'APICONSTANTS', '$cookies', 'projectFactory', function($resource, $q, APICONSTANTS, $cookies, projectFactory) {
        var d;
        var dataFactory;
        var initialized;
        d = $q.defer();

        dataFactory = {
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
            forgotPass: function() {
                return $resource(APICONSTANTS.apiHost + '/reset_password', {email: '@email'},
                    {
                        send: {method: 'POST', params: {email: '@email'}}
                    }
                );
            },
            signup: function() {
                return $resource(APICONSTANTS.apiHost + '/users/signup', {},
                    {
                        create: {method:'POST'}
                    }
                );
            },
            getPrivatePlanLimit: function() {
                var id = $cookies.get(APICONSTANTS.authCookie.user_id);
                var p = $q.defer();
                if (typeof id === 'string') {
                    dataFactory.get(id).then(function(response) {
                        if (
                            response[0].payment &&
                            (response[0].payment.plan_name === 'beta_monthly' || response[0].payment.plan_name === 'beta_yearly'))
                        {
                            p.resolve(10000000);
                        } else {
                            p.resolve(1);
                        }
                    });
                } else {
                    p.resolve(1);
                }
                return p.promise;
            },
            getPrivateProjectsRemaining: function() {
                var p = $q.defer();
                var privateProjects = [];
                projectFactory.getProjects().then(function(response) {
                    privateProjects = _.where(response.data, {public: false}); // jshint ignore:line
                    dataFactory.getPrivatePlanLimit().then(function(response) {
                        p.resolve(response - privateProjects.length);
                    });
                });
                return p.promise;
            }
        };

        return dataFactory;
    }])
;
