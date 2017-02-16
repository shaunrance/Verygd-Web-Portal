/* global angular */
angular.module('ua5App')
    .factory('AuthResource', ['$resource', 'APICONSTANTS', function($resource, APICONSTANTS) {
        return {
            token: function() {
                return $resource(APICONSTANTS.apiHost + '/auth/token', {},
                    {
                        retrieve: {method:'POST'}
                    }
                );
            },
            socialToken: function() {
                return $resource(APICONSTANTS.apiHost + '/auth/social/token', {},
                    {
                        retrieve: {method:'POST'}
                    }
                );
            },
            socialSignUp: function() {
                return $resource(APICONSTANTS.apiHost + '/users/social/signup', {},
                    {
                        retrieve: {method:'POST'}
                    }
                );
            }
        };
    }])
;
