/* global angular */
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
        $scope.basicAccount = true;

        $scope.showModal = function() {

            ModalService.showModal({
                templateUrl: 'modals/billingModal.html',
                controller: 'billingModalController',
                inputs: {
                    fields:{
                        title: '-',
                        formLabels:[{name: 'name', title: 'Name'}, {name:'description', title: 'Description'}],
                        showFileUpload: false,
                        submitButtonText: 'Add Project'
                    }
                }
            }).then(function(modal) {
                modal.close.then(function(result) {
                    console.log(result);
                });
            });
        };

        function initialValues() {
            UsersResource.user().retrieve({id: userId}).$promise.then(
                function(response) {
                    $scope.type = 'Basic';
                    if (response.payment) {
                        $scope.name = response.payment.name;
                        $scope.number = response.payment.last4;
                        $scope.month = response.payment.exp_month;
                        $scope.year = response.payment.exp_year;
                        $scope.cvc = '***';
                        $scope.zip = response.payment.address_zip;

                        if (response.payment.interval) {
                            $scope.type = 'Premium';
                            $scope.basicAccount = false;
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

        $scope.updateUser = function(data) {
            var paymentData;

            paymentData = {
                plan_name: data.paymentType ? 'annual' : 'monthly',
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
