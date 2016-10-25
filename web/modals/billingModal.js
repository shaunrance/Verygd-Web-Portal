/* global angular */
angular.module('ua5App')
	.controller('billingModalController', ['$timeout', '$scope', '$rootScope', '$state', '$element', 'fields', 'close', 'UsersResource', 'AuthResource', '$cookies', 'APICONSTANTS', function($timeout, $scope, $rootScope, $state, $element, fields, close, UsersResource, AuthResource, $cookies, APICONSTANTS) {
        var userId = $cookies.get(APICONSTANTS.authCookie.user_id);
        $scope.annualChecked = false;
        $scope.monthlyChecked = true;
        $scope.annualChosen = true;
        $scope.plan_name = {};

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

        function initialValues() {
            UsersResource.user().retrieve({id: userId}).$promise.then(
                function(response) {
                    if (response.payment) {
                        $scope.plan_name.type = response.payment.plan_name;
                        $scope.name = response.payment.name;
                        $scope.number = '************' + response.payment.last4;
                        $scope.month = response.payment.exp_month;
                        $scope.year = response.payment.exp_year;
                        $scope.cvc = '***';
                        $scope.zip = response.payment.address_zip;

                        if (response.payment.last4) {
                            $scope.premiumClicked = true;
                        }
                    }
                },
                function(error) {

                    $scope.name = 'card name';
                    $scope.number = 'card number';
                    $scope.month = 'exp month';
                    $scope.year = 'exp year';
                    $scope.cvc = 'cvc';
                    $scope.zip = 'zip code';
                }
            );
        }

        $scope.annualPlan = function() {
            $scope.annualChecked = true;
            $scope.monthlyChecked = false;
            $scope.plan_name.type = 'annual';
            $rootScope.$broadcast('annualPlanChosen');
        };

        $scope.monthlyPlan = function() {
            $scope.annualChecked = false;
            $scope.monthlyChecked = true;
            $scope.plan_name.type = 'monthly';
            $rootScope.$broadcast('monthlyPlanChosen');
        };

        $scope.updateUser = function(data) {
            var paymentData;

            paymentData = {
                plan_name: $scope.plan_name,
                card: {
                    name: data.name,
                    number: data.cardNumber,
                    exp_month: data.month,
                    exp_year: data.year,
                    cvc: data.cvc,
                    address_zip: data.zip
                }
            };

            UsersResource.user().update({id: userId, payment: paymentData}).$promise.then(
                function(response) {
                    $state.reload();
                },
                function(error) {
                    console.log(error);
                }
            );
        };

        $rootScope.deferredTerms.promise.then(function(response) {
            var data = $scope.model;
            $scope.updateUser(data);
        });

        initialValues();
    }])
;
