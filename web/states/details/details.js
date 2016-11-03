/* global angular, _, Modernizr, $ */
angular.module('ua5App.details', ['ngFileUpload', 'color.picker'])
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('projects.details', {
                name: 'Details',
                url: '/{projectId}',
                templateUrl: 'states/details/details.html',
                controller: 'detailsCtrl',
                controllerAs: 'ctrl',
                data: {
                    settings:{displayName:'First Project'}
                },
                resolve: {
                    privateProjectsRemaining: ['UsersResource', function(UsersResource) {
                        return UsersResource.getPrivateProjectsRemaining().then(function(privateProjectsRemaining) {
                            return privateProjectsRemaining;
                        });
                    }]
                }
            })
            .state('p.details', {
                name: 'Details',
                url: '/{projectId}',
                templateUrl: 'states/details/details.html',
                controller: 'detailsPublicCtrl',
                controllerAs: 'ctrl',
                data: {
                    settings:{displayName:'First Project'}
                }
            })
        ;
    }])
    .controller('detailsCtrl', ['$scope', '$stateParams', '$rootScope', 'projectFactory', 'sceneFactory', 'panelFactory', 'ModalService', 'BrowserFactory', 'APICONSTANTS', '$cookies', 'ngMeta', 'privateProjectsRemaining', function($scope, $stateParams, $rootScope, projectFactory, sceneFactory, panelFactory, ModalService, BrowserFactory, APICONSTANTS, $cookies, ngMeta, privateProjectsRemaining) {
        var keys = {37: 1, 38: 1, 39: 1, 40: 1};
        var isMobileChrome = window.navigator.userAgent.includes('CriOS');

        $rootScope.showMobileMenu = false;
        $scope.firstLoad = true;
        $scope.currentScenePanels = [];
        $scope.currentScene = '';
        $scope.privateProject = true;
        $scope.hasTouch = Modernizr.touch;
        $scope.showSceneList = false;
        $scope.log = '';
        $scope.projectId = $stateParams.projectId;
        $scope.projectName = '';
        $scope.privateProjectsRemaining = privateProjectsRemaining;
        $scope.sceneTypeToggle = {};
        $scope.colorOptions = {
            format: 'hex',
            alpha: false,
            swatchPos: 'right'
        };

        if (BrowserFactory.isWkWebView() && !isMobileChrome) {
            $scope.isWkWebView = true;
        }

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

        $scope.launchSceneiOS = function() {
            window.webkit.messageHandlers.observe.postMessage({
                sceneId: $scope.currentScene,
                projectId: $scope.projectId,
                authToken: $cookies.get(APICONSTANTS.authCookie.token)
            });
        };

        //SCENE methods ======================================================//
        //====================================================================//
        $scope.$on('nav:add-scene', function() {
            $scope.addScene();
        });

        $scope.$on('public:true', function() {
            $scope.projectPrivacy = false;

            if ($scope.projectPrivacy === true) {
                $scope.privateProjectsRemaining--;
            } else {
                $scope.privateProjectsRemaining++;
            }
        });

        $scope.$on('toggle:switched', function($event, args) {
            if (args === 'sceneTypeToggle') {
                sceneFactory.editScene($scope.currentScene, {
                    is_panorama: $scope.sceneTypeToggle,
                    title: $scope.sceneName,
                    project: $stateParams.projectId
                }).then(function() {
                    getSceneInfo($scope.currentScene);
                });
            } else if (args === 'projectPrivacy') {
                projectFactory.editProject($scope.project.id, {name: $scope.project.name, public: !$scope.projectPrivacy}); //jshint ignore:line

                if ($scope.projectPrivacy === true) {
                    $scope.privateProjectsRemaining--;
                } else {
                    $scope.privateProjectsRemaining++;
                }
            }
        });

        $scope.openMobileMenu = function() {
            if (!$rootScope.showMobileMenu) {
                $rootScope.showMobileMenu = true;
                disableScroll();
            } else {
                $rootScope.showMobileMenu = false;
                enableScroll();
            }
        };

        $scope.openShare = function() {
            ModalService.showModal({
                templateUrl: 'modals/shareModal.html',
                controller: 'shareModalController',
                inputs: {
                    fields:{
                        title: 'Share Project',
                        formLabels:[{title: 'URL'}],
                        showFileUpload: false,
                        submitButtonText: 'Share',
                        project: $stateParams.projectId
                    }
                }
            }).then(function(modal) {
                modal.close.then(function(result) {
                    $('body').removeClass('no-scroll');
                });
            });
        };

        $scope.addScene = function() {
            $('body').addClass('no-scroll');
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
                $('body').removeClass('no-scroll');
                modal.close.then(function(result) {
                    if (result.input.name !== '') {
                        createScene(result.input);
                    }
                });
            });
        };

        $scope.changeScene = function(sceneId) {
            $scope.currentScene = sceneId;
            //getSceneInfo(sceneId);
            getPanels(sceneId);
            if ($scope.showMobileMenu) {
                $scope.openMobileMenu();
            }
        };

        $scope.editScene = function(sceneId, sceneTitle) {
            ModalService.showModal({
                templateUrl: 'modals/editModal.html',
                controller: 'editModalController',
                inputs: {
                    fields:{
                        title: 'Edit Scene',
                        formLabels:[{name: 'name', title: sceneTitle}],
                        showFileUpload: false,
                        submitButtonText: 'Save'
                    }
                }
            }).then(function(modal) {
                modal.close.then(function(result) {
                    if (result.input.name !== sceneTitle && result.input.name !== '') {
                        sceneFactory.editScene(sceneId, {
                            project: $stateParams.projectId,
                            title: result.input.name
                        });
                        getScenes();
                        getSceneInfo(sceneId);
                    }
                });
            });
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

        $scope.eventApi = {
            onChange: function(api, color, $event) {
                $scope.sceneColor = color;
                sceneFactory.editScene($scope.currentScene, {
                    background: $scope.sceneColor,
                    project: $stateParams.projectId,
                    title: $scope.sceneName
                });
                getSceneInfo($scope.currentScene);
            }
        };

        function getSceneInfo(sceneId) {
            sceneFactory.getSceneById(sceneId)
                .then(function(response) {
                    if (response.data.is_panorama) {
                        $scope.sceneTypeToggle.active = true;
                    } else {
                        $scope.sceneTypeToggle.active = false;
                    }
                    $scope.sceneColor = response.data.background;
                    $scope.sceneName = response.data.title;
                });
        }

        function createScene(scene) {
            sceneFactory.addScene(scene, $scope.projectId)

                .then(function(response) {
                    getScenes();
                    $scope.changeScene(response.data.id);
                }, function(error) {

                });
        }

        function getScenes() {
            projectFactory.getProjectById($stateParams.projectId)
                .then(function(response) {
                    $scope.project = response.data;
                    $scope.projectPrivacy = !$scope.project.public; //jshint ignore:line

                    if (response.data.content.length > 0) {
                        $scope.scenes = response.data.content;
                        $scope.projectName = response.data.name;
                        ngMeta.setTitle($scope.projectName + ' | My Projects');

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
                })
            ;
        }

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
                        submitButtonTextLink: 'Save',
                        submitButtonTextCancel: 'Cancel',
                        scenes: $scope.scenes,
                        content: content,
                        allPanels: $scope.panels
                    }
                }
            }).then(function(modal) {
                modal.close.then(function() {
                    getPanels($scope.currentScene);
                });
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
                    panelFactory.editPanel(panel.id, {order: (key + 1)});

                    panel.order = key + 1;
                });
            }
        };

        function getPanels(sceneId) {
            $scope.panels = '';
            sceneFactory.getSceneById(sceneId)
                .then(function(response) {
                    if (response.data.is_panorama) {
                        $scope.sceneTypeToggle.active = true;
                    } else {
                        $scope.sceneTypeToggle.active = false;
                    }
                    $scope.sceneColor = response.data.background;
                    $scope.sceneName = response.data.title;

                    if (response.data.content.length > 0) {
                        $scope.panels = response.data.content;
                        $scope.panels = _.sortBy($scope.panels, 'order');

                        _.each($scope.panels, function(panel) {
                            if (panel.related_tag !== null) {
                                _.each($scope.scenes, function(scene) {
                                    if (parseInt(panel.related_tag, 10) === scene.id) {
                                        panel.relatedSceneName = scene.title;
                                    }
                                });
                            }
                        });

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
    .controller('detailsPublicCtrl', ['$scope', '$stateParams', '$rootScope', 'projectFactory', 'sceneFactory', 'panelFactory', 'ModalService', 'BrowserFactory', 'APICONSTANTS', '$cookies', function($scope, $stateParams, $rootScope, projectFactory, sceneFactory, panelFactory, ModalService, BrowserFactory, APICONSTANTS, $cookies) {
        $scope.hideCta = true;
        $scope.publicView = true;
        $scope.firstLoad = true;
        $scope.hasTouch = true;
        $scope.projectId = $stateParams.projectId;

        $scope.changeScene = function(sceneId) {
            $scope.currentScene = sceneId;
            getPanels(sceneId);
            if ($scope.showMobileMenu) {
                $scope.openMobileMenu();
            }
        };

        function getPublicScenes() {
            var validScenes = [];
            projectFactory.getProjectByPubId($stateParams.projectId)
                .then(function(response) {
                    $scope.project = response.data;
                    $scope.projectName = $scope.projectName = response.data.name;
                    if (response.data.content.length > 0) {
                        $scope.scenes = response.data.content;
                        _.each($scope.scenes, function(scene) {
                            if (scene.content.length > 0) {
                                validScenes.push(scene);
                            }
                        });
                        $scope.scenes = validScenes;
                        //check if page is first load, if so, make first scene selected
                        if ($scope.firstLoad) {
                            $scope.changeScene($scope.scenes[0].id);
                            $scope.firstLoad = false;
                        }
                    }

                }, function(error) {
                    $scope.projectsMessage = 'This project does not exist';
                });
        }

        function getPanels(sceneId) {
            $scope.panels = [];
            _.each($scope.scenes, function(scene) {
                if (scene.id === sceneId) {
                    $scope.panels = scene.content;
                    $scope.sceneName = scene.title;
                    $scope.sceneTypeToggle.active = scene.is_panorama;
                }
            });

            _.each($scope.panels, function(panel) {
                if (panel.related_tag !== null) {
                    _.each($scope.scenes, function(scene) {
                        if (parseInt(panel.related_tag, 10) === scene.id) {
                            panel.relatedSceneName = scene.title;
                        }
                    });
                }
            });
        }

        getPublicScenes();
    }])
;
