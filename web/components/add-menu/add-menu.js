/* global angular */
angular.module('ua5App')
    .directive('addMenu', [function() {
        return {
            restrict: 'A',
            templateUrl: 'components/add-menu/add-menu.html',
            link: function($scope, element, attrs) {},
            controller:['$scope', '$state', '$stateParams', 'ModalService', '$rootScope', function($scope, $state, $stateParams, ModalService, $rootScope) {
                var menu = {
                    project:'Add Project',
                    //team: 'Add Team Member',
                    scene:'Add Scene',
                    screen: 'Add Panel',
                    share: 'Share Project'
                };
                var keys = {37: 1, 38: 1, 39: 1, 40: 1};

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

                function preventDefault(e) {
                    e = e || window.event;
                    if (e.preventDefault) {
                        e.preventDefault();
                    }
                    e.returnValue = false;
                }

                function preventDefaultForScrollKeys(e) {
                    if (keys[e.keyCode]) {
                        preventDefault(e);
                        return false;
                    }
                }

                function disableScroll() {
                    if (window.addEventListener) {
                        window.addEventListener('DOMMouseScroll', preventDefault, false);
                    }
                    window.onwheel = preventDefault; // modern standard
                    window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
                    window.ontouchmove  = preventDefault; // mobile
                    document.onkeydown  = preventDefaultForScrollKeys;
                }

                function enableScroll() {
                    if (window.removeEventListener) {
                        window.removeEventListener('DOMMouseScroll', preventDefault, false);
                    }
                    window.onmousewheel = document.onmousewheel = null;
                    window.onwheel = null;
                    window.ontouchmove = null;
                    document.onkeydown = null;
                }

                $scope.menuToggle = false;

                $scope.$watch('menuToggle', function() {
                    getOptions();
                });

                $scope.close = function() {
                    $scope.menuToggle = false;
                };

                $scope.toggleAddMenu = function() {
                    if (!$scope.menuToggle) {
                        $scope.menuToggle = true;
                        disableScroll();
                    } else {
                        $scope.menuToggle = false;
                        if (!$rootScope.showMobileMenu) {
                            enableScroll();
                        }
                    }
                };

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
                                    // check to see if name input is empty before calling 'addProject'

                                    if (result.input.name !== '') {
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
                            $rootScope.$broadcast('nav:add-scene');
                            break;
                        case menu.screen:
                            $rootScope.$broadcast('nav:add-panel');
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
