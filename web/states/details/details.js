/* global angular, _, Modernizr, $ */
angular.module('ua5App.details', ['ngFileUpload', 'color.picker', 'xeditable'])
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
        var isMobileChrome = window.navigator.userAgent.indexOf('CriOS') > -1;

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
        $scope.privateProjectsRemaining = {};
        $scope.privateProjectsRemaining.number = privateProjectsRemaining;
        $scope.sceneTypeToggle = {};
        $scope.projectPrivacy = {};
        $scope.sceneType = 'panel';

        $scope.colorOptions = {
            format: 'hex',
            alpha: false,
            swatchPos: 'right'
        };
        $scope.showSceneInstructions = true;

        $scope.hotspotTypes = [
            'Minimal',
            'Visible Rectangles',
            'Visible Points',
            'Disabled'
        ];

        $scope.hotspotType = {};
        $scope.hotspotType.type = 'Minimal'

        //Determine which background type is active (color, gradient, or image
        //when we grab the scene from the api
        $scope.sceneColorActive = 'color';
        $scope.sceneBackgroundChange = function(type) {
            $scope.sceneColorActive = type;
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
            $scope.projectPrivacy.active = false;

            if ($scope.projectPrivacy === true) {
                $scope.privateProjectsRemaining.number--;
            } else {
                $scope.privateProjectsRemaining.number++;
            }
        });

        $scope.$on('toggle:switched', function($event, args) {
            if (args === 'sceneTypeToggle.active') {
                sceneFactory.editScene($scope.currentScene, {
                    is_panorama: $scope.sceneTypeToggle.active,
                    title: $scope.sceneName,
                    project: $stateParams.projectId
                }).then(function() {
                    getSceneInfo($scope.currentScene);
                });
            } else if (args === 'projectPrivacy.active') {
                projectFactory.editProject($scope.project.id, {name: $scope.project.name, public: !$scope.projectPrivacy.active}); //jshint ignore:line

                if ($scope.projectPrivacy.active === true) {
                    $scope.privateProjectsRemaining.number--;
                } else {
                    $scope.privateProjectsRemaining.number++;
                }
            }
        });

        $scope.openMobileMenu = function() {
            if (!$rootScope.showMobileMenu) {
                $rootScope.showMobileMenu = true;
                disableScroll();
                $('.project-details__container').css('max-width', $('.project-details__container').width());
                $('.project-details__container').css('position', 'fixed');
            } else {
                $rootScope.showMobileMenu = false;
                setTimeout(function() {
                    $('.project-details__container').css('position', 'relative');
                    $('.project-details__container').css('max-width', '100%');
                }, 150);
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
                        project: $stateParams.projectId,
                        scene: $scope.currentScene
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

        $scope.editHotspots = function(panelData) {
            $('body').addClass('no-scroll');
            ModalService.showModal({
                templateUrl: 'modals/hotspotModal.html',
                controller: 'hotspotController',
                inputs: {
                    content: panelData,
                    scenes: $scope.scenes
                }

            }).then(function(modal) {

                modal.close.then(function(result) {
                    $('body').removeClass('no-scroll');
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

        $scope.editBackground = function(type) {
            $scope.sceneColorActive = type;
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
                var data = {};

                $scope.sceneColor = $scope.sceneColorActive === 'color' ? color : null;
                $scope.sceneImage = $scope.sceneColorActive === 'image' ? $scope.sceneImage : null;
                console.log($scope.hotspotType.type)
                data = {
                    background: color,
                    equirectangular_background_image: $scope.sceneImage,
                    project: $stateParams.projectId,
                    title: $scope.sceneName,
                    hotspot_type: $scope.hotspotType.type
                };

                sceneFactory.editScene($scope.currentScene, data);
            }
        };

        $scope.imageChange = function(file) {
            $scope.sceneColorActive = 'image';
            $scope.sceneImage = file;
            $scope.eventApi.onChange(null, null, null);
        };

        $scope.hotspotTypeChange = function() {
            $scope.eventApi.onChange(null, null, null);
        };

        $scope.sceneDeleteImage = function() {
            //If user deletes the scene image, set the scene background to black
            $scope.sceneImage = null;
            $scope.sceneColorActive = 'color';
            $scope.eventApi.onChange(null, '#000000', null);
        };

        function getSceneInfo(sceneId) {
            sceneFactory.getSceneById(sceneId)
                .then(function(response) {
                    if (response.data.is_panorama) {
                        $scope.sceneTypeToggle.active = true;
                    } else {
                        $scope.sceneTypeToggle.active = false;
                    }

                    $scope.hotspotType.type = (response.data.hotspot_type) ? response.data.hotspot_type : 'Minimal';
                    $scope.sceneColor = response.data.background && response.data.background !== 'null' ? response.data.background : null;
                    $scope.sceneImage = response.data.equirectangular_background_image;
                    $scope.sceneName = response.data.title;

                    if ($scope.sceneColor) {
                        $scope.sceneColorActive = 'color';
                    } else {
                        $scope.sceneColorActive = 'image';
                    }
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
                    $scope.projectPrivacy.active = !$scope.project.public; //jshint ignore:line

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
                    $scope.sceneColor = response.data && response.data.background !== 'null' ? response.data.background : null;
                    $scope.sceneImage = response.data.equirectangular_background_image;
                    $scope.sceneName = response.data.title;
                    $scope.hotspotType.type = (response.data.hotspot_type) ? response.data.hotspot_type : 'Minimal';

                    if ($scope.sceneColor) {
                        $scope.sceneColorActive = 'color';
                    } else {
                        $scope.sceneColorActive = 'image';
                        $scope.sceneImage = {
                            url: $scope.sceneImage,
                            name: $scope.sceneImage ? $scope.sceneImage.replace('https://verygd.imgix.net/images/', '') : null
                        };
                    }

                    //legacy isPanorama support:
                    if (!response.data.scene_type) {
                        if (response.data.is_panorama) {
                            $scope.sceneType = 'cylinder';
                        } else {
                            $scope.sceneType = 'panel';
                        }
                    } else {
                        $scope.sceneType = response.data.scene_type;
                    }

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

                        // if ($scope.showSceneInstructions) {
                        //     ModalService.showModal({
                        //         templateUrl: 'modals/sceneInstructModal.html',
                        //         controller: 'sceneInstructModal',
                        //         inputs: {
                        //             fields: {
                        //                 panels: [
                        //                     {
                        //                         title: 'Let\'s get started.',
                        //                         modules: [
                        //                             {
                        //                                 icon: '/assets/img/icon-jpeg.svg'
                        //                             },
                        //                             {
                        //                                 icon: '/assets/img/icon-png.svg'
                        //                             },
                        //                             {
                        //                                 icon: '/assets/img/icon-gif.svg'
                        //                             },
                        //                             {
                        //                                 icon: '/assets/img/icon-mp4.svg',
                        //                                 text: 'Coming Soon'
                        //                             }
                        //                         ],
                        //                         texts: [
                        //                             'To create VR with very.gd, just upload your images (video support coming shortly) as individual panels or wrap around panorama photos.'
                        //                         ]
                        //                     },
                        //                     {
                        //                         title: 'Take it for a spin.',
                        //                         modules: [
                        //                             {
                        //                                 icon: '/assets/img/icon-mobile.svg'
                        //                             },
                        //                             {
                        //                                 icon: '/assets/img/cardboard-pink.svg'
                        //                             },
                        //                             {
                        //                                 icon: '/assets/img/icon-vr.svg',
                        //                                 text: 'Coming Soon'

                        //                             }
                        //                         ],
                        //                         texts: [
                        //                             'Once you’ve created a project, uploaded content, and added hotspots you can view your content via desktop browser, mobile, or in stereoscopic VR.'
                        //                         ]
                        //                     }
                        //                 ],
                        //                 submitButtonText: 'Next'
                        //             }
                        //         }
                        //     }).then(function() {
                        //         $scope.showSceneInstructions = false;
                        //     });
                        // }
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

        $scope.setType = function(type) {
            $scope.sceneType = type;
            sceneFactory.editScene($scope.currentScene, {
                title: $scope.sceneName,
                project: $scope.projectId,
                scene_type: type
            });
        };

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

        projectFactory.getProjects()
            .then(function(response) {
                var scenesWithPanels = 0;
                _.each(response.data, function(project) {
                    if (project.content.length > 0) {
                        _.each(project.content, function(scene) {
                            if (scene.content.length > 0) {
                                scenesWithPanels++;
                            }
                        });
                    }
                });
                if (scenesWithPanels > 0) {
                    $scope.showSceneInstructions = false;
                } else {
                    $scope.showSceneInstructions = true;
                }

                getScenes();
            });

    }])
    .controller('detailsPublicCtrl', ['$scope', '$stateParams', '$rootScope', 'projectFactory', 'sceneFactory', 'panelFactory', 'ModalService', 'BrowserFactory', 'APICONSTANTS', '$cookies', function($scope, $stateParams, $rootScope, projectFactory, sceneFactory, panelFactory, ModalService, BrowserFactory, APICONSTANTS, $cookies) {
        $scope.hideCta = true;
        $scope.publicView = true;
        $scope.firstLoad = true;
        $scope.hasTouch = true;
        $scope.projectId = $stateParams.projectId;
        $scope.sceneTypeToggle = {};

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
