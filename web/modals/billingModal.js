/* global angular */
angular.module('ua5App')
    .controller('billingModalController', ['$timeout', '$scope', '$rootScope', '$state', '$element', 'fields', 'close', 'UsersResource', 'AuthResource', '$cookies', 'APICONSTANTS', function($timeout, $scope, $rootScope, $state, $element, fields, close, UsersResource, AuthResource, $cookies, APICONSTANTS) {
        var userId = $cookies.get(APICONSTANTS.authCookie.user_id);
        $scope.currentPlan = 'beta_monthly';
        $scope.selectedPlan = $scope.currentPlan;
        $scope.paymentShowing = false;
        $scope.isBasic = true;
        $scope.name = {};
        $scope.card = {};
        $scope.month = {};
        $scope.year = {};
        $scope.cvc = {};
        $scope.zip = {};

        $scope.title = 'Pricing';
        $scope.price = 25;
        $scope.buttonText = 'Charge my card ' + $scope.price + ' right now';
        $scope.input = {};

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
            if (fields.payment) {
                $scope.currentPlan = fields.plan;
                if ($scope.currentPlan === 'beta_monthly') {
                    $scope.isBasic = false;
                    $scope.selectedPlan = 'beta_monthly';
                    $scope.planType = 'Monthly';
                    $scope.price = 25;
                } else if ($scope.currentPlan === 'beta_yearly') {
                    $scope.isBasic = false;
                    $scope.selectedPlan = 'beta_yearly';
                    $scope.planType = 'Annual';
                    $scope.price = 240;
                } else {
                    $scope.monthlyChecked = true;
                    $scope.isBasic = true;
                    $scope.planType = 'Basic';
                }

                $scope.name.name = fields.name;
                $scope.card.number = '';
                $scope.month.number = fields.month;
                $scope.year.number = fields.year;
                $scope.cvc.number = '';
                $scope.zip.number = fields.zip;
            } else {
                $scope.currentPlan = 'basic';
                $scope.planType = 'Basic';
            }
        }

        $scope.annualPlan = function() {
            $scope.selectedPlan = 'beta_yearly';
            $scope.price = 240;
        };

        $scope.monthlyPlan = function() {
            $scope.selectedPlan = 'beta_monthly';
            $scope.price = 25;
        };

        $scope.updateUser = function() {
            var paymentData;

            if ($scope.cvc.number !== '') {
                paymentData = {
                    plan_name: $scope.selectedPlan,
                    card: {
                        name: $scope.name.name,
                        number: $scope.card.number,
                        exp_month: $scope.month.number,
                        exp_year: $scope.year.number,
                        cvc: $scope.cvc.number,
                        address_zip: $scope.zip.number
                    }
                };

                UsersResource.user().update({id: userId, payment: paymentData}).$promise.then(
                    function(response) {
                        UsersResource.resetUser();
                        $state.reload();
                        $scope.message = 'Information saved!';
                        $scope.errorMessage = false;
                        $scope.currentPlan = $scope.selectedPlan;
                        $scope.input = {
                            fields: {
                                name: $scope.name.name,
                                number: $scope.card.number,
                                exp_month: $scope.month.number,
                                exp_year: $scope.year.number,
                                cvc: $scope.cvc.number,
                                address_zip: $scope.zip.number,
                                plan_name: $scope.currentPlan
                            }
                        };

                        setTimeout(function() {
                            $scope.close();
                        }, 1500);
                    },
                    function(error) {
                        $scope.message = 'There was an issue with your payment details. Please try again.';
                        $scope.errorMessage = true;
                    }
                );
            } else {
                $scope.message = 'Please enter a valid CVC';
                $scope.errorMessage = true;
            }

        };

        $scope.showPayment = function() {
            if (!$scope.paymentShowing) {
                $scope.paymentShowing = true;
            } else {
                $scope.paymentShowing = false;
            }
        };

        $scope.updateBasic = function() {
            UsersResource.user().update({id: userId, payment: {plan_name: 'basic'}}).$promise.then(
                function(response) {
                    UsersResource.resetUser();
                    $state.reload();
                    $scope.input = {
                        fields: {
                            name: $scope.name.name,
                            number: $scope.card.number,
                            exp_month: $scope.month.number,
                            exp_year: $scope.year.number,
                            cvc: $scope.cvc.number,
                            address_zip: $scope.zip.number,
                            plan_name: 'basic'
                        }
                    };
                    $scope.close();
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
