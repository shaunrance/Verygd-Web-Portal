/* global angular, $ */
angular.module('ua5App')
    .directive('upgrade', ['$cookies', 'APICONSTANTS', 'ModalService', 'UsersResource', function($cookies, APICONSTANTS, ModalService, UsersResource) {
        return {
            restrict: 'A',
            templateUrl: 'components/upgrade/upgrade.html',
            scope: {
                useSimple: '@'
            },
            link: function($scope, element, attrs) {
                var ctaCookie = $cookies.get(APICONSTANTS.authCookie.cta);
                $scope.hideCta = true;
                $scope.name = {};
                $scope.card = {};
                $scope.month = {};
                $scope.year = {};
                $scope.cvc = {};
                $scope.zip = {};

                UsersResource.get().then(function(user) {
                    $scope.user = user[0];
                    getUser();
                });

                $scope.closeCta = function() {
                    $scope.hideCta = true;
                    if (ctaCookie !== 'closeCta') {
                        $cookies.put(APICONSTANTS.authCookie.cta, 'closeCta');
                    }
                };

                $scope.plansModal = function() {
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

                function getUser() {
                    if ($scope.user.payment && ctaCookie !== 'closeCta') {
                        if ($scope.user.payment.plan_name === 'free_test_plan') {
                            $scope.hideCta = false;
                        }

                        $scope.month.number = $scope.user.payment.exp_month < 10 ? '0' + $scope.user.payment.exp_month.toString() : $scope.user.payment.exp_month.toString();
                        $scope.year.number = $scope.user.payment.exp_year.toString();
                        $scope.zip.number = $scope.user.payment.address_zip;
                    }

                    $scope.name.name = $scope.user.name;
                }
            }
        };
    }])
;
