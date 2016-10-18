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

        $scope.updateUser = function(data) {
            console.log('sdfkhsdj');
            var user;

            user = {
                name: data.name,
                email: data.email,
                password: data.password,
                payment: {
                    plan_name: data.a_plan_name,
                    card: {
                        name: data.name_on_card,
                        number: data.card_number,
                        exp_month: data.month,
                        exp_year: data.year,
                        cvc: data.cvc,
                        address_zip: data.zip
                    }
                }
            };

            UsersResource.user().update(user).$promise.then(
                function(response) {
                    AuthResource.token().retrieve({username: user.email, password: user.password}).$promise.then(
                        function(response) {
                            //set cookie token && then go to projects
                            $cookies.put(APICONSTANTS.authCookie.token, response.token);
                            $cookies.put(APICONSTANTS.authCookie.user_id, response.member_id);

                            $state.go('projects');
                        },
                        function(error) {
                            $state.go('sign-up');
                        }
                    );
                },
                function(error) {

                }
            );
        };
    }])
;
