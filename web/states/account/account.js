/* global angular */
angular.module('ua5App.account', ['ngFileUpload'])
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.when('account/account', '/account');
        $stateProvider.state('account', {
            name: 'Account',
            url: '/account',
            templateUrl: 'states/account/account.html',
            controller: 'accountCtrl',
            controllerAs: 'ctrl',
            data: {
                settings:{displayName: 'Account'}
            }
        });
    }])
    .controller('accountCtrl', ['$rootScope', 'UsersResource', '$scope', '$state', 'APICONSTANTS', '$cookies', function($rootScope, UsersResource, $scope, $state, APICONSTANTS, $cookies) {

        $scope.userId = $cookies.get(APICONSTANTS.authCookie.user_id);
        if (!$scope.userId) {
            $state.go('sign-in');
        }

        function getUserInfo() {
            //We have set a deferred rootscope promise in app.js
            //the header will set this response for the user object
            //and then other components that need to make use of this response
            //(ie feed.js) can use $rootScope.deferredUser.promise.then(function(response)
            if ($rootScope.userResponse) {
                $scope.userName = $rootScope.userResponse.name;
                $scope.userAdmin = true; //TODO set this correctly after other members can be added
            } else {
                var userId = $cookies.get(APICONSTANTS.authCookie.user_id);

                if (!userId) {
                    $state.go('sign-in');
                } else {
                    UsersResource.user().retrieve({id: userId}).$promise.then(
                        function(response) {
                            $rootScope.userResponse = response;
                            $rootScope.deferredUser.resolve(response);

                            $scope.email = response.email;
                            $scope.userName = response.name;
                            $scope.title = $scope.userName;

                            $scope.userAdmin = true; //TODO set this correctly after other members can be added
                        },
                        function(error) {
                            if (error.status === 401) {
                                $state.go('sign-in');
                            }
                        }
                    );
                }
            }
        }

        function init() {
            getUserInfo();
        }
        init();
    }])
;
