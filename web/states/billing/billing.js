/* global angular, $ */
angular.module('ua5App.billing')
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $stateProvider.state('account.billing', {
            name: 'Billing',
            url: '/billing',
            templateUrl: 'states/billing/billing.html',
            controller: 'billingCtrl',
            controllerAs: 'ctrl',
            data: {
                settings:{displayName:'Billing'}
            }
        });
    }])
    .controller('billingCtrl', ['$rootScope', '$scope', '$state', 'ModalService', 'AuthResource', 'APICONSTANTS', '$cookies', 'UsersResource', function($rootScope, $scope, $state, ModalService, AuthResource, APICONSTANTS, $cookies, UsersResource) {
        var userId = $cookies.get(APICONSTANTS.authCookie.user_id);
        $scope.annualStatement = 'Next Payment of $250 will be processed on 12/01/2017';
        $scope.monthlyStatement = 'Next Payment of $25 will be processed on 11/01/2016';
        $scope.errorMessage = null;
        $scope.disableButton = true;
        $scope.annualChosen = true;
        $scope.showCardInfo = false;

        $scope.showModal = function() {
            $('body').addClass('no-scroll');
            ModalService.showModal({
                templateUrl: 'modals/billingModal.html',
                controller: 'billingModalController',
                inputs: {
                    fields:{
                        title: '-',
                        formLabels:[{name: 'name', title: 'Name'}, {name:'description', title: 'Description'}],
                        plan: $scope.plan_name,
                        name: $scope.name,
                        number: $scope.number,
                        month: $scope.month,
                        year: $scope.year,
                        zip: $scope.zip,
                        showFileUpload: false,
                        submitButtonText: 'Add Project'
                    }
                }
            }).then(function(modal) {
                modal.close.then(function(result) {
                    $('body').removeClass('no-scroll');
                });
            });
        };

        function initialValues() {
            UsersResource.user().retrieve({id: userId}).$promise.then(
                function(response) {
                    if (response.payment) {
                        $scope.plan_name = response.payment.plan_name;
                        $scope.showCardInfo = true;

                        if ($scope.plan_name === 'annual') {
                            $scope.monthlyBilling = false;
                            $scope.type = 'Premium';
                        } else if ($scope.plan_name === 'monthly') {
                            $scope.monthlyBilling = true;
                            $scope.type = 'Premium';
                        } else {
                            $scope.type = 'Basic';
                        }

                        $scope.name = response.payment.name;
                        $scope.number = '************' + response.payment.last4;
                        $scope.month = response.payment.exp_month;
                        $scope.year = response.payment.exp_year;
                        $scope.cvc = '***';
                        $scope.zip = response.payment.address_zip;
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

        // $scope.$on('annualPlanChosen', function() {
        //     $scope.monthlyBilling = false;
        // });
        //
        // $scope.$on('monthlyPlanChosen', function() {
        //     $scope.monthlyBilling = true;
        // });

        // $scope.switchBilling = function(data) {
        //     if (!$scope.annualChosen) {
        //         $scope.annualChosen = true;
        //         $scope.plan_name = 'monthly';
        //     } else {
        //         $scope.annualChosen = false;
        //         $scope.plan_name = 'annual';
        //     }
        // };

        $scope.updateUser = function(data) {
            var paymentData;
            paymentData = {
                plan_name: $scope.plan_name,
                card: {
                    name: data.cardName,
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

                }
            );
        };

        initialValues();
    }])
;
