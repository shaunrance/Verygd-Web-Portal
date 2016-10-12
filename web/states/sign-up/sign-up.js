/* global angular */
angular.module('ua5App.sign-up')
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.when('', '/sign-up');
        $urlRouterProvider.otherwise('/sign-up');
        $stateProvider.state('sign-up', {
            url: '/sign-up',
            templateUrl: 'states/sign-up/sign-up.html',
            controller: 'signUpCtrl',
            controllerAs: 'ctrl'
        });
    }])
    .controller('signUpCtrl', ['$scope', 'ModalService', function($scope, ModalService) {

        $scope.showModal = function() {
            ModalService.showModal({
                templateUrl: 'modals/signUpModal.html',
                controller: 'signUpModalController',
                inputs: {
                    fields:{
                        title: 'sduhk'
                    }
                }
            });
        };
    }])
;
