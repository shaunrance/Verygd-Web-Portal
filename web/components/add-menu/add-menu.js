/* global angular */
angular.module('ua5App')
    .directive('addMenu', [function() {
        return {
            restrict: 'A',
            templateUrl: 'components/add-menu/add-menu.html',
            link: function($scope, element, attrs) {},
            controller:['$scope', '$state', '$stateParams', 'ModalService', function($scope, $state, $stateParams, ModalService) {
                var menu = {
                    project:'Add Project',
                    //team: 'Add Team Member',
                    scene:'Add Scene',
                    //screen: 'Add Screen',
                    share: 'Share Project'
                };

                var getOptions = function() {
                    if ($state.current.name !== 'projects.details') {
                        $scope.menuItems = {
                            project:'Add Project',
                            team: 'Add Team Member'
                        }; 
                    } else {
                        $scope.menuItems = menu;
                    }
                };
                
                $scope.menuToggle = false;

                $scope.$watch('menuToggle', function() {
                    getOptions();
                });

                $scope.showModal = function(type) {
                    switch (type){
                        case menu.project:
                            ModalService.showModal({
                                templateUrl: 'modals/addModal.html',
                                controller: 'addModalController',
                                inputs: {
                                    fields:{
                                        title: menu.project,
                                        formLabels:[{name: 'name', title: 'Name'}, {name:'description', title: 'Description'}],
                                        showFileUpload: false,
                                        submitButtonText: 'Add Project'
                                    }
                                }
                            }).then(function(modal) {
                                modal.close.then(function(result) {
                                    if (result.input) {
                                        $scope.$emit('addProject', result.input);
                                        $scope.menuToggle = false;
                                    }
                                });
                            });
                            break;
                        case menu.team:
                            ModalService.showModal({
                                templateUrl: 'modals/addModal.html',
                                controller: 'addModalController',
                                inputs: {
                                    fields:{
                                        title: menu.team,
                                        formLabels:[{name: 'memberName', title: 'Email Address'}],
                                        showFileUpload: false,
                                        submitButtonText: 'Add Team Member'
                                    }
                                }
                            }).then(function(modal) {
                                modal.close.then(function(result) {
                                
                                });
                            });
                            break;
                        case menu.scene:
                            // ModalService.showModal({
                            //     templateUrl: 'modals/addModal.html',
                            //     controller: 'addModalController',
                            //     inputs: {
                            //         fields:{
                            //             title: menu.scene,
                            //             formLabels:[{name: 'name', title: 'Name'}],
                            //             showFileUpload: true,
                            //             submitButtonText: 'Add Scene'
                            //         }
                            //     }
                            // }).then(function(modal) {
                            //     modal.close.then(function(result) {
                            //     });
                            // });
                            $scope.$broadcast('nav:add-scene');
                            $scope.menuToggle = false;
                            break;
                        case menu.screen:
                            ModalService.showModal({
                                templateUrl: 'modals/addModal.html',
                                controller: 'addModalController',
                                inputs: {
                                    fields:{
                                        title: menu.screen,
                                        formLabels:[{name: 'name', title: 'Name'}, {name:'description', title: 'Description'}],
                                        showFileUpload: true,
                                        submitButtonText: 'Add Screen'
                                    }
                                }
                            }).then(function(modal) {
                                modal.close.then(function(result) {
                                
                                });
                            });
                            break;
                        case menu.share:
                            ModalService.showModal({
                                templateUrl: 'modals/shareModal.html',
                                controller: 'shareModalController',
                                inputs: {
                                    fields:{
                                        title: menu.share,
                                        formLabels:[{title: 'URL'}],
                                        showFileUpload: false,
                                        submitButtonText: 'Share'
                                    }
                                }
                            }).then(function(modal) {
                                modal.close.then(function(result) {
                                
                                });
                            });
                            break;
                    }
                };
                
            }]
        };
    }])
;
