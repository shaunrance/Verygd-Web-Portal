/* global angular, $, THREE */
// Create templates module for ngTemplates to attach to
angular.module('ua5Templates', []);
// start module declaration
angular.module('ua5App.home', []);
angular.module('ua5App.projects', []);
angular.module('ua5App.viewer', []);
angular.module('ua5App.details', []);
angular.module('ua5App.scene', []);
// end module declaration
// Create parent module for application
angular.module('ua5App', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngTouch',
    'ua5Templates',
    'ui.router',
    'as.sortable',
    'angulartics',
    'angulartics.google.analytics',
    'angular-loading-bar',
    'angularModalService',
    'ngMeta',
    'suite',
    'color.picker',
    // start add states as app dependency
    'ua5App.scene',
    'ua5App.details',
    'ua5App.projects',
    'ua5App.viewer',
    'ua5App.home',
    'ngAnimate'
    // end add states as app dependency
])
    .constant('BREAKPOINTS', {
        MOBILE: 375,
        PHABLET: 767,
        TABLET: 991,
        LAPTOP: 1199,
        DESKTOP: 1430
    })
    .constant('APICONSTANTS', {
        //TODO add option for production server
        apiHost: 'http://216.70.115.196:7777',
        authCookie: {
            token: 'vg-user',
            user_id: 'vg-member'
        }
    })
    .config(['$analyticsProvider', '$locationProvider', '$httpProvider', 'ngMetaProvider', function($analyticsProvider, $locationProvider, $httpProvider, ngMetaProvider) {
        $locationProvider.html5Mode(true);
        // Prevents bounce rate of 0.01
        $analyticsProvider.firstPageview(false);
        //intercept $resolves to add token authorization to header
        $httpProvider.interceptors.push('authInterceptor');
        ngMetaProvider.useTitleSuffix(true);
        ngMetaProvider.setDefaultTitleSuffix(' | Site Name');
        ngMetaProvider.setDefaultTitle('Page');
        ngMetaProvider.setDefaultTag('url', 'URL');
        ngMetaProvider.setDefaultTag('description', 'Site description');
        ngMetaProvider.setDefaultTag('image', 'URL');
    }])
    .run(['ngMeta', '$q', '$rootScope', function(ngMeta, $q, $rootScope) {
        ngMeta.init();
        //This rootscope promise is being set so that the portal header can
        //call the /user api once and all components will have access to that info
        $rootScope.deferredUser = $q.defer();
        $rootScope.deferredTerms = $q.defer();
    }])
    .directive('app', ['$rootScope', function($rootScope) {
        return {
            link: function($scope, $element, $attrs) {
                var $$window;
                $$window = $(window);
                $$window.on('resize', function() {
                    $rootScope.$broadcast('app:resized');
                });
                $$window.on('click', function(e) {
                    $rootScope.$broadcast('app:clicked', e.target);
                });
                $$window.on('scroll', function(e) {
                    $rootScope.$broadcast('app:scrolled');
                });
                $$window.on('keydown', function(e) {
                    var ESCAPE = 27;
                    var keyCode;
                    keyCode = e.keyCode;
                    // Escape key
                    if (keyCode === ESCAPE) {
                        $rootScope.$broadcast('app:escape:pressed');
                    }
                });
                $rootScope.$on('$stateChangeSuccess', function(e, toState, toStateParams, fromState) {
                    var regex = /^([^.]*).*/;
                    var toStateName = toState.name;
                    var fromStateName = fromState.name;
                    var toStateParent = toStateName.match(regex)[1];
                    var fromStateParent = fromStateName.match(regex)[1];
                    $rootScope.pageClass = 'page-' + toState.name.replace('.', '-');
                    // Only scroll to top of page if navigating away from a
                    // parent / child relationship. For example, do not scroll
                    // to top if going from the state "contact" to the state
                    // "contact.overlay".
                    if (toStateParent !== fromStateParent) {
                        $$window.scrollTop(0);
                    }
                });

                $rootScope.renderer = new THREE.WebGLRenderer({
                    antialias: true
                });
            }
        };
    }])
;
