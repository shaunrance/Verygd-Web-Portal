/* global angular */
angular.module('ua5App')
    .controller('billingModalController', ['$timeout', '$scope', '$rootScope', '$state', '$element', 'fields', 'close', 'UsersResource', 'AuthResource', '$cookies', 'APICONSTANTS', function($timeout, $scope, $rootScope, $state, $element, fields, close, UsersResource, AuthResource, $cookies, APICONSTANTS) {
        var userId = $cookies.get(APICONSTANTS.authCookie.user_id);
        $scope.currentPlan = 'monthly';
        $scope.selectedPlan = $scope.currentPlan;
        $scope.isBasic = true;
        $scope.name = {};
        $scope.card = {};
        $scope.month = {};
        $scope.year = {};
        $scope.cvc = {};
        $scope.zip = {};

        $scope.title = 'Pricing';
        $scope.formLabels = 'dfdsf';
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
            UsersResource.user().retrieve({id: userId}).$promise.then(
                function(response) {
                    if (response.payment) {
                        $scope.currentPlan = response.payment.plan_name;

                        if ($scope.currentPlan === 'annual') {
                            $scope.isBasic = false;
                            $scope.planType = 'Premium';
                            $scope.price = 250;
                        } else if ($scope.currentPlan === 'monthly') {
                            $scope.isBasic = false;
                            $scope.planType = 'Premium';
                            $scope.price = 25;
                        } else {
                            $scope.monthlyChecked = true;
                            $scope.isBasic = true;
                            $scope.planType = 'Basic';
                        }

                        $scope.name.name = response.payment.name;
                        $scope.card.number = '';
                        $scope.month.number = response.payment.exp_month < 10 ? '0' + response.payment.exp_month.toString() : response.payment.exp_month.toString();
                        $scope.year.number = response.payment.exp_year.toString();
                        $scope.cvc.number = '';
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
            $scope.selectedPlan = 'annual';
            $scope.price = 250;
            $rootScope.$broadcast('annualPlanChosen');
        };

        $scope.monthlyPlan = function() {
            $scope.selectedPlan = 'monthly';
            $scope.price = 25;
            $rootScope.$broadcast('monthlyPlanChosen');
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

            UsersResource.user().update({id: userId, payment: paymentData}).$promise.then(
                function(response) {
                    $state.reload();
                },
                function(error) {
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
