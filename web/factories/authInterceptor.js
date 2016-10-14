/* global angular */
angular.module('ua5App')
    .factory('authInterceptor', ['APICONSTANTS', '$cookies', '$injector', function(APICONSTANTS, $cookies, $injector) {
        function request(config) {
            if (config.url.indexOf(APICONSTANTS.apiHost) >= 0) {
                //Check for auth (set as cookies) if we're NOT on the login or signup page
                //these pages need to set the cookies after getting a response object
                var cookies = $cookies.get(APICONSTANTS.authCookie.token),
                    currentState = $injector.get('$state').current.name;

                if ((currentState === 'home') && (config.url.indexOf('/users') < 0)) {
                    return config;
                }

                //redirect user to login if they dont have credentials
                if (!cookies) {
                    $injector.get('$state').transitionTo('home');
                } else {
                    config.headers.Authorization = 'Token ' + cookies;
                }
            }

            return config;
        }

        return {
            request: request
        };
    }])
;
