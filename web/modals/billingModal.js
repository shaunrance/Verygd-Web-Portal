/* global angular */
angular.module('ua5App')
    .controller('billingModalController', ['$timeout', '$scope', '$rootScope', '$state', '$element', 'fields', 'close', 'UsersResource', 'AuthResource', '$cookies', 'APICONSTANTS', function($timeout, $scope, $rootScope, $state, $element, fields, close, UsersResource, AuthResource, $cookies, APICONSTANTS) {
        var userId = $cookies.get(APICONSTANTS.authCookie.user_id);
        $scope.currentPlan = 'monthly';
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
            $scope.currentPlan = fields.plan;
            if ($scope.currentPlan === 'monthly') {
                $scope.isBasic = false;
                $scope.selectedPlan = 'monthly';
                $scope.planType = 'Monthly';
                $scope.price = 25;
            } else if ($scope.currentPlan === 'annual') {
                $scope.isBasic = false;
                $scope.selectedPlan = 'annual';
                $scope.planType = 'Annual';
                $scope.price = 250;
            } else {
                $scope.monthlyChecked = true;
                $scope.isBasic = true;
                $scope.planType = 'Basic';
            }

            $scope.name.name = fields.name;
            $scope.card.number = '';
            $scope.month.number = fields.month < 10 ? '0' + fields.month.toString() : fields.month.toString();
            $scope.year.number = fields.year.toString();
            $scope.cvc.number = '';
            $scope.zip.number = fields.zip;
        }

        $scope.annualPlan = function() {
            $scope.selectedPlan = 'annual';
            $scope.price = 250;
        };

        $scope.monthlyPlan = function() {
            $scope.selectedPlan = 'monthly';
            $scope.price = 25;
        };

        $scope.updateUser = function() {
            var paymentData;

            if ($scope.cvc.number !== '') {
                if ($scope.card.number.includes('*')) {
                    paymentData = {
                        plan_name: $scope.selectedPlan,
                        card: {
                            name: $scope.name.name,
                            exp_month: $scope.month.number,
                            exp_year: $scope.year.number,
                            cvc: $scope.cvc.number,
                            address_zip: $scope.zip.number
                        }
                    };
                } else {
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
                }

                UsersResource.user().update({id: userId, payment: paymentData}).$promise.then(
                    function(response) {
                        $state.reload();
                        $scope.message = 'Information saved!';
                        $scope.errorMessage = false;

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
            UsersResource.user().update({id: userId, payment: {plan_name: 'free_test_plan'}}).$promise.then(
                function(response) {
                    $state.reload();
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
