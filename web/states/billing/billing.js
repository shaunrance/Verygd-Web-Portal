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
    .controller('billingCtrl', ['$rootScope', '$scope', '$state', 'ModalService', 'AuthResource', 'APICONSTANTS', '$cookies', 'user', 'UsersResource', function($rootScope, $scope, $state, ModalService, AuthResource, APICONSTANTS, $cookies, user, UsersResource) {
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
            //$scope.user passed in from parent Account State

            if ($scope.user.payment) {
                $scope.plan_name = $scope.user.payment.plan_name;
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

                $scope.name = $scope.user.payment.name;
                $scope.number = '************' + $scope.user.payment.last4;
                $scope.month = $scope.user.payment.exp_month;
                $scope.year = $scope.user.payment.exp_year;
                $scope.cvc = '***';
                $scope.zip = $scope.user.payment.address_zip;
            }
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
