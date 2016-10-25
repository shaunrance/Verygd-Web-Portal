/* global angular */
angular.module('ua5App')
	.controller('billingModalController', ['$timeout', '$scope', '$rootScope', '$state', '$element', 'fields', 'close', 'UsersResource', 'AuthResource', '$cookies', 'APICONSTANTS', function($timeout, $scope, $rootScope, $state, $element, fields, close, UsersResource, AuthResource, $cookies, APICONSTANTS) {
        var userId = $cookies.get(APICONSTANTS.authCookie.user_id);
        $scope.plan_name = {};
        $scope.card = {};
        $scope.name = {};
        $scope.cvc = {};
        $scope.zip = {};
        $scope.year = {};
        $scope.month = {};

        $scope.title = 'Professional Plan';
        $scope.formLabels = fields.formLabels;
        $scope.currentPlan = '$25.00/mo';
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
                        $scope.annualChecked = response.payment.plan_name === 'annual' ? true : false;
                        $scope.monthlyChecked = response.payment.plan_name === 'monthly' ? true : false;
                        $scope.plan_name.type = response.payment.plan_name;
                        $scope.name.name = response.payment.name;
                        $scope.card.number = '************' + response.payment.last4;
                        $scope.month.number = response.payment.exp_month < 10 ? '0' + response.payment.exp_month.toString() : response.payment.exp_month.toString();
                        $scope.year.number = response.payment.exp_year.toString();
                        $scope.cvc.number = '***';
                        $scope.zip.number = response.payment.address_zip;

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
        };

        $scope.monthlyPlan = function() {
            $scope.annualChecked = false;
            $scope.monthlyChecked = true;
            $scope.plan_name.type = 'monthly';
        };

        $scope.updateUser = function() {
            var paymentData;
            paymentData = {
                plan_name: $scope.plan_name.type,
                card: {
                    name: $scope.name.name,
                    number: $scope.card.number,
                    exp_month: $scope.month.number,
                    exp_year: $scope.year.number,
                    cvc: $scope.cvc.number,
                    address_zip: $scope.zip.number
                }
            };

            console.log(paymentData.plan_name);

            UsersResource.user().update({id: userId, payment: paymentData}).$promise.then(
                function(response) {
                    console.log(response);
                    //console.log(paymentData.plan_name);
                    if (paymentData.plan_name === 'year') {
                        console.log('annual plan chosen');
                        $rootScope.$broadcast('annualPlanChosen');
                    } else {
                        console.log('monthly plan chosen');
                        $rootScope.$broadcast('monthlyPlanChosen');
                    }
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
