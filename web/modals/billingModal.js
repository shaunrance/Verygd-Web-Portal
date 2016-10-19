/* global angular */
angular.module('ua5App')
	.controller('billingModalController', ['$scope', '$rootScope', '$state', '$element', 'fields', 'close', 'UsersResource', 'AuthResource', '$cookies', 'APICONSTANTS', function($scope, $rootScope, $state, $element, fields, close, UsersResource, AuthResource, $cookies, APICONSTANTS) {
        $scope.title = 'Professional Plan';
        $scope.currentPlan = '$25.00/mo';
        $scope.formLabels = 'dfdsf';
        $scope.price = '$' + 25;
        $scope.buttonText = 'Charge my card ' + $scope.price + ' right now';
        $scope.input = {
            fields: {
                name: '',
                description: ''
            }
        };
        $scope.close = function() {
            close({
                input: $scope.input.fields
            });
        };
        $scope.cancel = function() {
            close({
                input: $scope.input.fields
            });
        };

        $scope.updateUser = function(data) {
            var user;

            user = {
                name: data.name,
                email: data.email,
                password: data.password,
                payment: {
                    plan_name: data.paymentType,
                    card: {
                        name: data.cardName,
                        number: data.cardNumber,
                        exp_month: data.month,
                        exp_year: data.year,
                        cvc: data.cvc,
                        address_zip: data.zip
                    }
                }
            };

            UsersResource.user().update(user).$promise.then(
                function(response) {
                    AuthResource.token().retrieve({username: user.email, password: user.password}).$promise.then(
                        function(response) {
                            //set cookie token && then go to projects
                            $cookies.put(APICONSTANTS.authCookie.token, response.token);
                            $cookies.put(APICONSTANTS.authCookie.user_id, response.member_id);

                            $state.go('projects');
                        },
                        function(error) {
                            $state.go('sign-up');
                        }
                    );
                },
                function(error) {

                }
            );
        };

        $rootScope.deferredTerms.promise.then(function(response) {
            var data = $scope.model;
            $scope.updateUser(data);
        });
    }])
;
