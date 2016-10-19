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
    .controller('billingCtrl', ['$scope', '$state', 'ModalService', 'AuthResource', 'APICONSTANTS', '$cookies', 'UsersResource', function($scope, $state, ModalService, AuthResource, APICONSTANTS, $cookies, UsersResource) {
        var userId = $cookies.get(APICONSTANTS.authCookie.user_id);

        $scope.showModal = function() {
            ModalService.showModal({
                templateUrl: 'modals/billingModal.html',
                controller: 'billingModalController',
                inputs: {
                    fields:{
                        title: 'ksdjbdsj',
                        formLabels:[{name: 'name', title: 'Name'}, {name:'description', title: 'Description'}],
                        showFileUpload: false,
                        submitButtonText: 'Add Project'
                    }
                }
            });
        };

        function initialValues() {
            UsersResource.user().retrieve({id: userId}).$promise.then(
                function(response) {
                    $scope.moodel = {
                        payment: {
                            plan_name: response.paymentType,
                            card: {
                                name: response.cardName,
                                number: response.cardNumber,
                                exp_month: response.month,
                                exp_year: response.year,
                                cvc: response.cvc,
                                address_zip: response.zip
                            }
                        }
                    };
                    console.log(response);
                }
            );
        }

        $scope.updateUser = function(data) {
            var paymentData;

            paymentData = {
                plan_name: data.paymentType,
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
                    debugger;
                    $state.reload();
                },
                function(error) {
                    debugger;
                }
            );
        };

        initialValues();
    }])
;
