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
    .controller('billingCtrl', ['$rootScope', '$scope', '$state', 'ModalService', 'AuthResource', 'APICONSTANTS', '$cookies', 'user', 'UsersResource', 'ngMeta', function($rootScope, $scope, $state, ModalService, AuthResource, APICONSTANTS, $cookies, user, UsersResource, ngMeta) {
        var userId = $cookies.get(APICONSTANTS.authCookie.user_id);
        $scope.message = null;
        $scope.disableButton = true;
        $scope.annualChosen = true;
        $scope.showCardInfo = false;
        $scope.name = {};
        $scope.card = {};
        $scope.month = {};
        $scope.year = {};
        $scope.cvc = {};
        $scope.zip = {};

        $scope.showModal = function() {
            $('body').addClass('no-scroll');
            ModalService.showModal({
                templateUrl: 'modals/billingModal.html',
                controller: 'billingModalController',
                inputs: {
                    fields:{
                        title: '-',
                        formLabels:[{name: 'name', title: 'Name'}, {name:'description', title: 'Description'}],
                        payment: $scope.user.payment ? true : false,
                        plan: $scope.plan_name,
                        name: $scope.name.name,
                        number: $scope.card.number,
                        month: $scope.month.number,
                        year: $scope.year.number,
                        zip: $scope.zip.number,
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

                if ($scope.plan_name === 'beta_monthly') {
                    $scope.monthlyBilling = true;
                    $scope.type = 'Paid Beta';
                    $scope.showAnnualToggle = true;
                } else if ($scope.plan_name === 'beta_yearly') {
                    $scope.monthlyBilling = false;
                    $scope.type = 'Paid Beta';
                    $scope.showAnnualToggle = true;
                } else {
                    $scope.type = 'Basic';
                    $scope.showAnnualToggle = false;
                }

                $scope.name.name = $scope.user.payment.name;
                $scope.card.number = '';
                $scope.card.placeHolder = '************' + $scope.user.payment.last4;
                $scope.month.number = $scope.user.payment.exp_month < 10 ? '0' + $scope.user.payment.exp_month.toString() : $scope.user.payment.exp_month.toString();
                $scope.year.number = $scope.user.payment.exp_year.toString();
                $scope.cvc.number = '';
                $scope.zip.number = parseInt($scope.user.payment.address_zip, 10);
            } else {
                $scope.type = 'Basic';
                $scope.showAnnualToggle = false;
            }
        }

        $scope.updateUser = function(data) {
            var paymentData;
            paymentData = {
                plan_name: $scope.plan_name,
                card: {
                    name: $scope.name.name,
                    number: $scope.card.number,
                    exp_month: $scope.month.number,
                    exp_year: $scope.year.number,
                    cvc: $scope.cvc.number,
                    address_zip: $scope.zip.number
                    //,coupon_code: 'VR_ENTHUSIAST'
                },
                coupon: ''
            };

            UsersResource.user().update({id: userId, payment: paymentData}).$promise.then(
                function(response) {
                    UsersResource.resetUser();
                    $state.reload();
                },
                function(error) {
                    $scope.message = 'There was an issue with your payment details. Please try again.';
                    $scope.errorMessage = true;
                }
            );
        };

        initialValues();
        ngMeta.setTitle('Billing');
    }])
;
