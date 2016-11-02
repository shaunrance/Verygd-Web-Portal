/* global angular */
angular.module('ua5App')
    .factory('intercomFactory', ['UsersResource', 'APICONSTANTS', '$cookies', function(UsersResource, APICONSTANTS, $cookies) {
        var dataFactory = {};
        var hasStarted = false;

        dataFactory.shutdown = function() {
            window.Intercom('shutdown');
        };

        dataFactory.ping = function() {
            var id = $cookies.get(APICONSTANTS.authCookie.user_id);

            if (typeof id === 'string') {
                UsersResource.get(id).then(function(response) {
                    if (!hasStarted) {
                        hasStarted = true;
                        window.Intercom('boot', {
                            app_id: 'jdy4df93',
                            name: response[0].name,
                            email: response[0].email,
                            user_hash: $cookies.get(APICONSTANTS.authCookie.intercom_token),
                            created_at: Date.now()
                        });
                    }
                });
            }
        };
        return dataFactory;

    }])
;
