/* global angular, _, $ */
angular.module('ua5App.projects')
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $stateProvider.state('projects', {
            name:'Projects',
            url: '/projects',
            templateUrl: 'states/projects/projects.html',
            controller: 'projectsCtrl',
            controllerAs: 'ctrl',
            data: {
                settings:{displayName:'My Projects'}
            },
            resolve: {
                user: ['UsersResource', function(UsersResource) {
                    return UsersResource.get().then(function(user) {
                        return user;
                    });
                }]
            }
        })
        .state('p', {
            name:'Projects',
            url: '/p',
            templateUrl: 'states/projects/p.html',
            controller: 'pCtrl',
            controllerAs: 'ctrl',
            data: {
                settings:{displayName:'My Projects'}
            }
        });
    }])
    .controller('projectsCtrl', ['$scope', '$rootScope', '$state', 'projectFactory', 'ModalService', 'AuthResource', 'APICONSTANTS', '$cookies', 'user', 'ngMeta', 'UsersResource', function($scope, $rootScope, $state, projectFactory, ModalService, AuthResource, APICONSTANTS, $cookies, user, ngMeta, UsersResource) {
        var addProject = function(project) {
            projectFactory.addProject(project)

            .then(function(response) {
                var id = response.data.id;
                $scope.emptyProjects = false;
                $state.go('projects.details', {projectId:id});
                //not really needed since the state changes anyways
                //getProjects();
            }, function(error) {

            });
        };
        $scope.title = 'projects';
        $scope.link = 'projects';
        $scope.emptyProjects = false;

        $scope.newProject = {};

        $scope.$on('addProject', function(event, args) {
            args.isPublic = ($scope.limit < 1);
            addProject(args);
        });

        $scope.createProject = function() {
            $('body').addClass('no-scroll');
            ModalService.showModal({
                templateUrl: 'modals/addModal.html',
                controller: 'addModalController',
                inputs: {
                    fields:{
                        title: 'Add Project',
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
                    }
                    $('body').removeClass('no-scroll');
                });
            });
        };

        $scope.deleteProject = function(projectId) {
            $('body').addClass('no-scroll');
            ModalService.showModal({
                templateUrl: 'modals/deleteModal.html',
                controller: 'deleteModalController',
                inputs: {
                    fields:{
                        title: 'Delete Project',
                        confirmText: 'Are you sure you would like to delete this project? Deleting will remove all content and scenes.',
                        submitButtonText: 'Delete'
                    }
                }
            }).then(function(modal) {
                modal.close.then(function(result) {
                    if (result) {
                        $('body').removeClass('no-scroll');
                        projectFactory.deleteScreen(projectId)

                            .then(function(response) {
                                    getProjects();
                                }, function(error) {
                                    $scope.status = 'Unable to delete project: ' + error.message;
                                });
                    }

                });
            });

        };

        function getProjects() {
            projectFactory.getProjects()

                .then(function(response) {
                    if (response.data.length === 0) {
                        $scope.emptyProjects = true;
                        ModalService.showModal({
                            templateUrl: 'modals/projectInstructModal.html',
                            controller: 'projectInstructModal',
                            inputs: {
                                fields: {
                                    modules: [
                                        {
                                            title: 'Create a Project',
                                            icons: [
                                                '/assets/img/icon-polygon-white.svg',
                                                '/assets/img/icon-pano-white.svg'
                                            ]
                                        },
                                        {
                                            title: 'Upload Content',
                                            icons: [
                                                '/assets/img/icon-upload.svg'
                                            ]
                                        },
                                        {
                                            title: 'Preview',
                                            icons: [
                                                '/assets/img/cardboard.svg'
                                            ]
                                        }
                                    ],
                                    texts: [
                                        'Projects can be either panel-based (using standard photos & videos) or panoramas for panorama content (360 photos will soon be able to be used as a background).',
                                        'Whether you’re working in .png, .jpg, .gjif, or other formats, we’ve got you covered. (video support coming shortly).',
                                        'View your content via desktop browser, mobile, or in stereoscopic VR. Each project consists of a scene made up of one or more panels.'
                                    ],
                                    submitButtonText: 'Continue'
                                }
                            }
                        });
                    }
                    $scope.projects = response.data;
                    _.each($scope.projects, function(project) {
                        var scenes = project.content;
                        var sceneImage = '';
                        var content = [];

                        scenes = _.sortBy(scenes, 'order');
                        content = scenes[0].content;
                        content = _.sortBy(content, 'order');

                        sceneImage = content.length > 0 ? content[0].url : '/assets/img/image-placeholder.jpg';

                        project.cover_image = sceneImage + '?fm=jpg&q=60&h=800&w=800&fit=max&bg=000000';
                    });
                }, function(error) {

                });
        }

        $scope.$on('$locationChangeStart', function(event) {
            if ($state.current.name === 'projects') {
                $cookies.put(APICONSTANTS.authCookie.visited, 'visited');
            }
        });

        UsersResource.getPrivateProjectsRemaining().then(function(response) {
            $scope.limit = response;
        });

        getProjects();
        ngMeta.setTitle('My Projects');
    }])
    .controller('pCtrl', ['$scope', '$state', function($scope, $state) {
        //$state.go('sign-up');
    }]);
