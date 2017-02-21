/* global angular */
angular.module('ua5App')
    .factory('AuthResource', ['$resource', 'APICONSTANTS', 'Facebook', '$q', function($resource, APICONSTANTS, Facebook, $q) {
        return {
            token: function() {
                return $resource(APICONSTANTS.apiHost + '/auth/token', {},
                    {
                        retrieve: {method:'POST', isPublic: true}
                    }
                );
            },
            socialToken: function() {
                return $resource(APICONSTANTS.apiHost + '/auth/social/token', {},
                    {
                        retrieve: {method:'POST', isPublic: true}
                    }
                );
            },
            socialSignUp: function() {
                return $resource(APICONSTANTS.apiHost + '/users/social/signup', {},
                    {
                        retrieve: {method:'POST', isPublic: true}
                    }
                );
            },
            facebookConnect: function() {
                var self = this;
                var deferred = $q.defer();

                //connect with facebook
                Facebook.login(function(fbResponse) {
                    if (fbResponse.status === 'connected') {
                        //try logging in first
                        self.socialToken().retrieve({
                            provider: 'facebook',
                            access_token: fbResponse.authResponse.accessToken
                        }).$promise.then(
                            function(response) {
                                //we're in!
                                deferred.resolve(response);
                            },
                            function(error) {
                                //try creating an account:
                                self.socialSignUp().retrieve({
                                    provider: 'facebook',
                                    access_token: fbResponse.authResponse.accessToken
                                }).$promise.then(
                                    function(response) {
                                        //we're created, now log in:
                                        self.socialToken().retrieve({
                                            provider: 'facebook',
                                            access_token: fbResponse.authResponse.accessToken
                                        }).$promise.then(function(response) {
                                            deferred.resolve(response);
                                        }, function(error) {
                                            deferred.reject(error);
                                        });
                                    },
                                    function(error) {
                                        // error!
                                        deferred.reject(error);
                                    }
                                );
                            }
                        );
                    } else {
                        deferred.reject(fbResponse);
                    }
                });

                return deferred.promise;
            }
        };
    }])
;
