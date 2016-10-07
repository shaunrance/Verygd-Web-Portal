/* global angular */
angular.module('ua5App.home')
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.when('', '/');
        $urlRouterProvider.otherwise('/');
        $stateProvider.state('home', {
            url: '/',
            templateUrl: 'states/home/home.html',
            controller: 'HomeCtrl',
            controllerAs: 'ctrl'
        });
    }])
    .controller('HomeCtrl', ['$scope', 'ModalService', function($scope, ModalService) {
        $scope.showModal = function() {
            ModalService.showModal({
                templateUrl: 'modals/signInModal.html',
                controller: 'signInModalController',
                inputs: {
                    fields:{
                        title: 'sduhk'
                    }
                }}).then(function(modal) {
                modal.close.then(function(result) {
                    if (result.input) {
                        $scope.$emit('addProject', result.input);
                        $scope.menuToggle = false;
                    }
                });
            });
        };
    }])
;
