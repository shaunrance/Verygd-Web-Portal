/* global angular */
angular.module('ua5App')
    .factory('AuthResource', ['$resource', 'APICONSTANTS', function($resource, APICONSTANTS) {
        return {
            token: function() {
                return $resource(APICONSTANTS.apiHost + '/auth/token', {},
                    {
                        retrieve: {method:'POST', isPublic: true}
                    }
                );
            }
        };
    }])
;
