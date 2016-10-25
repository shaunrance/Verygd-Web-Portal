/* global angular */
angular.module('ua5App')
	.controller('billingModalController', ['$timeout', '$scope', '$rootScope', '$state', '$element', 'fields', 'close', 'UsersResource', 'AuthResource', '$cookies', 'APICONSTANTS', function($timeout, $scope, $rootScope, $state, $element, fields, close, UsersResource, AuthResource, $cookies, APICONSTANTS) {
        var userId = $cookies.get(APICONSTANTS.authCookie.user_id);
        $scope.annualChecked = false;
        $scope.monthlyChecked = true;
        $scope.annualChosen = true;
        $scope.plan_name = 'annual';

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
                        $scope.plan_name = response.payment.month;
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
        };

        $scope.monthlyPlan = function() {
            $scope.annualChecked = false;
            $scope.monthlyChecked = true;
        };

        $scope.switchBilling = function(data) {
            if ($scope.annualChosen) {
                $scope.annualChosen = false;
                console.log($scope.annualChosen);
                console.log($scope.plan_name);
                $scope.plan_name = 'monthly';
            } else {
                $scope.annualChosen = true;
                console.log($scope.annualChosen);
                console.log($scope.plan_name);
                $scope.plan_name = 'annual';
            }
        };

        $scope.updateUser = function(data) {
            var paymentData;

            paymentData = {
                plan_name: data.paymentType ? 'annual' : 'monthly',
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
                    console.log(paymentData.plan_name);
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
                    debugger;
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
