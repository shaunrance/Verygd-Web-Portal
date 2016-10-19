/* global angular, _, Modernizr, $ */
angular.module('ua5App.details', ['ngFileUpload', 'color.picker'])
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $stateProvider.state('projects.details', {
            name: 'Details',
            url: '/{projectId}',
            templateUrl: 'states/details/details.html',
            controller: 'detailsCtrl',
            controllerAs: 'ctrl',
            data: {
                settings:{displayName:'First Project'}
            }
        });
    }])
    .controller('detailsCtrl', ['$scope', '$stateParams', 'projectFactory', 'sceneFactory', 'panelFactory', 'ModalService', function($scope, $stateParams, projectFactory, sceneFactory, panelFactory, ModalService) {
        $scope.panels = [];
        $scope.scenes = [];
        $scope.firstLoad = true;
        $scope.currentSceneScreens = [];
        $scope.currentScene = '';
        $scope.emptyScene = false;
        $scope.hasTouch = Modernizr.touch;
        $scope.showSceneList = false;
        $scope.$watch('files', function() {
            if (
                typeof $scope.files === 'object' &&
                $scope.files.length > 0 &&
                typeof $scope.files[0] === 'object'
            ) {
                uploadPanels($scope.files);
            }
        });
        $scope.$watch('file', function() {
            if ($scope.file !== null) {
                $scope.files = [$scope.file];
            }
        });
        $scope.log = '';
        $scope.projectId = $stateParams.projectId;
        $scope.colorOptions = {
            format: 'hex',
            alpha: false,
            swatchPos: 'right'
        };

        $scope.deleteScreen = function(screenId) {
            ModalService.showModal({
                templateUrl: 'modals/deleteModal.html',
                controller: 'deleteModalController',
                inputs: {
                    fields:{
                        title: 'Delete Screen',
                        confirmText: 'Are you sure you would like to delete this screen?',
                        submitButtonText: 'Delete'
                    }
                }
            }).then(function(modal) {
                modal.close.then(function(result) {
                    if (result) {
                        panelFactory.deleteScreen(screenId)

                        .then(function(response) {
                                //getScreens();
                            }, function(error) {
                                $scope.status = 'Unable to delete screen: ' + error.message;
                            });
                    }
                });
            });
        };

        $scope.linkContent = function(content) {
            ModalService.showModal({
                templateUrl: 'modals/linkModal.html',
                controller: 'linkModalController',
                inputs: {
                    fields:{
                        title: 'Link Panel',
                        formLabels:[{name: 'name', title: 'Name'}, {name:'description', title: 'Description'}],
                        showFileUpload: false,
                        submitButtonTextLink: 'Link',
                        submitButtonTextCancel: 'Cancel',
                        scenes: $scope.scenes,
                        content: content,
                        allScreens: $scope.screens
                    }
                }
            }).then(function(modal) {
            });
        };

        function uploadPanels(files) {
            var lastItemOrder = 0;
            if ($scope.currentSceneScreens.length > 0) {
                lastItemOrder = _.last($scope.currentSceneScreens).order + 1;
            }
            if (files && files.length) {
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];

                    panelFactory.insertPanel(
                        file,
                        $scope.currentScene,
                        lastItemOrder + i
                    )
                        .then(function(response) {
                                $scope.status = 'Success';
                                //getScreens();
                            }, function(error) {
                                $scope.status = 'Unable to insert screen: ' + error.message;
                            });
                }
            }
        }

        window.addEventListener('dragover', function(e) {
            e = e || event;
            e.preventDefault();
        }, false);

        window.addEventListener('drop', function(e) {
            e = e || event;
            e.preventDefault();
        }, false);

        // function getScreens() {
        //     panelFactory.getScreens($stateParams.projectId)
        //
        //         .then(function(response) {
        //             $scope.screens = response.data.content;
        //             $scope.screens = _.sortBy($scope.screens, 'order');
        //             $scope.currentSceneScreens = _.where($scope.screens, {tag: $scope.currentScene.toString()});
        //             _.each($scope.screens, function(screen) {
        //                 // screens should now have saved names
        //                 screen.screenName = screen.title !== 'name' ? screen.title : screen.url.split('https://verygd.imgix.net/images/').join('');
        //                 if (parseInt(screen.tag, 10) > $scope.scenes.length) {
        //                     $scope.currentScene = parseInt(screen.tag, 10);
        //                 }
        //             });
        //             $scope.emptyScene = $scope.currentSceneScreens.length > 0 ? false : true;
        //         }, function(error) {
        //             $scope.status = 'Unable to load screen data: ' + error.message;
        //         });
        // }

        function getPanels(sceneId) {
            $scope.panels = [];

            sceneFactory.getSceneById(sceneId)
                .then(function(response) {
                    if (response.data.content.length > 0) {
                        _.each(response.data.content, function(panel) {
                            $scope.panels.push(panel);
                        });
                    } else {
                        $scope.emptyScene = true;
                    }
                });
        }

        function getScenes() {
            $scope.scenes = [];
            projectFactory.getProjectById($stateParams.projectId)
                .then(function(response) {
                    if (response.data.content.length > 0) {
                        _.each(response.data.content, function(scene) {
                            $scope.scenes.push(scene);
                        });

                        //check if page is first load, if so, make first scene selected
                        if ($scope.firstLoad) {
                            $scope.changeScene($scope.scenes[0].id);
                            $scope.firstLoad = false;
                        }
                    } else {
                        //new project, create first scene by default
                        var newScene = {
                            name: 'Scene 1',
                            description: ''
                        };

                        createScene(newScene);
                    }
                });
        }

        $scope.changeScene = function(sceneId) {
            var scenes;
            $scope.currentScene = sceneId;
            scenes = _.where($scope.screens, {tag: sceneId.toString()});
            $scope.currentSceneScreens = _.sortBy(scenes, 'order');
            $scope.showSceneList = false;
            getPanels(sceneId);
        };

        $scope.deleteScene = function(sceneId) {
            if ($scope.scenes.length > 1) {
                ModalService.showModal({
                    templateUrl: 'modals/deleteModal.html',
                    controller: 'deleteModalController',
                    inputs: {
                        fields:{
                            title: 'Delete Scene',
                            confirmText: 'Are you sure you would like to delete this scene?',
                            submitButtonText: 'Delete'
                        }
                    }
                }).then(function(modal) {
                    modal.close.then(function(result) {
                        if (result) {
                            sceneFactory.deleteScene(sceneId)

                            .then(function(response) {
                                    $scope.currentScene = $scope.scenes[0].id;
                                    getScenes();
                                }, function(error) {
                                    $scope.status = 'Unable to delete screen: ' + error.message;
                                });
                        }
                    });
                });
            } else {

                alert('All projects must have at least one scene');
            }

        };

        function createScene(scene) {
            sceneFactory.addScene(scene, $scope.projectId)

                .then(function(response) {
                    getScenes();
                    $scope.changeScene(response.data.id);
                }, function(error) {

                });
        }

        $scope.addScene = function() {
            ModalService.showModal({
                templateUrl: 'modals/addModal.html',
                controller: 'addModalController',
                inputs: {
                    fields:{
                        title: 'Add New Scene',
                        formLabels:[{name: 'name', title: 'Name'}],
                        showFileUpload: false,
                        submitButtonText: 'Add Scene'
                    }
                }
            }).then(function(modal) {
                modal.close.then(function(result) {
                    if (result.input.name !== '') {
                        createScene(result.input);
                    }
                });
            });
        };

        $scope.toggleSceneList = function() {
            $scope.showSceneList = !$scope.showSceneList;
        };

        $scope.getScene = function(num) {
            return new Array(num);
        };

        $scope.$on('nav:add-scene', function() {
            $scope.addScene();
        });

        $scope.dragControlListeners = {
            orderChanged: function(event) {
                _.each($scope.currentSceneScreens, function(screen, key) {
                    panelFactory.editScreen(screen.id, {order: key + 1});
                    //update the order in the view also:
                    screen.order = key + 1;
                });
            }
        };

        $scope.$on('nav:add-screen', function() {
            //Todo make this more angular friendly
            $('#uploadInput').click();
        });

        getScenes();
        //getScreens();
    }])
;
