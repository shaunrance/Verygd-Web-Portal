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
        $scope.firstLoad = true;
        $scope.currentScenePanels = [];
        $scope.currentScene = '';
        $scope.hasTouch = Modernizr.touch;
        $scope.showSceneList = false;
        $scope.log = '';
        $scope.projectId = $stateParams.projectId;
        $scope.colorOptions = {
            format: 'hex',
            alpha: false,
            swatchPos: 'right'
        };

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

        //SCENE methods ======================================================//
        //====================================================================//
        $scope.$on('nav:add-scene', function() {
            $scope.addScene();
        });

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

        $scope.changeScene = function(sceneId) {
            var scenes;
            $scope.currentScene = sceneId;
            scenes = _.where($scope.screens, {tag: sceneId.toString()});
            $scope.currentSceneScreens = _.sortBy(scenes, 'order');
            $scope.showSceneList = false;
            getPanels(sceneId);
        };

        $scope.deleteScene = function($index, sceneId) {
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
                                    $scope.scenes.splice($index, 1);
                                    $scope.currentScene = $scope.scenes[0].id;
                                    getScenes();
                                    getPanels($scope.currentScene);
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

        $scope.toggleSceneList = function() {
            $scope.showSceneList = !$scope.showSceneList;
        };

        function createScene(scene) {
            sceneFactory.addScene(scene, $scope.projectId)

                .then(function(response) {
                    getScenes();
                    $scope.changeScene(response.data.id);
                }, function(error) {

                });
        }

        function getScenes() {
            //$scope.scenes = [];
            projectFactory.getProjectById($stateParams.projectId)
                .then(function(response) {
                    if (response.data.content.length > 0) {
                        $scope.scenes = response.data.content;

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

        //PANEL methods ======================================================//
        //====================================================================//
        $scope.$on('nav:add-panel', function() {
            //Todo make this more angular friendly
            $('#uploadInput').click();
        });

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

        $scope.deletePanel = function(panelId) {
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
                        panelFactory.deletePanel(panelId)

                        .then(function(response) {
                                getPanels($scope.currentScene);
                            }, function(error) {
                                $scope.status = 'Unable to delete screen: ' + error.message;
                            });
                    }
                });
            });
        };

        $scope.dragControlListeners = {
            orderChanged: function(event) {
                _.each($scope.panels, function(panel, key) {
                    panelFactory.editPanel(panel.id, {order: key + 1});
                    //update the order in the view also:
                    panel.order = key + 1;
                });

                $scope.panels = _.sortBy($scope.panels, 'order');
                console.log($scope.panels);
            }
        };

        function getPanels(sceneId) {
            $scope.panels = '';
            sceneFactory.getSceneById(sceneId)
                .then(function(response) {
                    if (response.data.content.length > 0) {
                        $scope.panels = response.data.content;
                        $scope.panels = _.sortBy($scope.panels, 'order');
                        $scope.emptyScene = false;
                    } else {
                        $scope.emptyScene = true;
                    }
                });
        }

        function uploadPanels(files) {
            var lastItemOrder = 0;
            if ($scope.panels.length > 0) {
                lastItemOrder = _.last($scope.panels).order + 1;
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
                                getPanels($scope.currentScene);
                            }, function(error) {
                                $scope.status = 'Unable to insert screen: ' + error.message;
                            });
                }
            }
        }

        //WINDOW methods =====================================================//
        //====================================================================//
        window.addEventListener('dragover', function(e) {
            e = e || event;
            e.preventDefault();
        }, false);

        window.addEventListener('drop', function(e) {
            e = e || event;
            e.preventDefault();
        }, false);

        //INIT ===============================================================//
        //====================================================================//
        getScenes();
    }])
;
