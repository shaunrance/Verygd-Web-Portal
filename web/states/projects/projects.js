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
        });
    }])
    .controller('projectsCtrl', ['$scope', '$rootScope', '$state', 'projectFactory', 'ModalService', 'AuthResource', 'APICONSTANTS', '$cookies', 'user', function($scope, $rootScope, $state, projectFactory, ModalService, AuthResource, APICONSTANTS, $cookies, user) {
        var addProject = function(project) {
            projectFactory.addProject(project)

            .then(function(response) {
                var id = response.data.id;
                $state.go('projects.details', {projectId:id});
                //not really needed since the state changes anyways
                //getProjects();
            }, function(error) {

            });
        };
        var ctaCookie = $cookies.get(APICONSTANTS.authCookie.cta);
        $scope.hideCta = true;
        $scope.user = user[0];
        $scope.name = {};
        $scope.card = {};
        $scope.month = {};
        $scope.year = {};
        $scope.cvc = {};
        $scope.zip = {};

        $scope.title = 'projects';

        $scope.newProject = {};

        $scope.$on('addProject', function(event, args) {
            addProject(args);
        });

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

        $scope.closeCta = function() {
            $scope.hideCta = true;
            if (ctaCookie !== 'closeCta') {
                $cookies.put(APICONSTANTS.authCookie.cta, 'closeCta');
            }
        };

        function getProjects() {
            projectFactory.getProjects()

                .then(function(response) {
                    $scope.projects = response.data;
                    _.each($scope.projects, function(project) {
                        var scenes = project.content;
                        var sceneImage = '';

                        scenes = _.sortBy(scenes, 'order');
                        sceneImage = scenes[0].content.length > 0 ? scenes[0].content[0].url : '/assets/img/image-placeholder.jpg';

                        project.cover_image = sceneImage + '?fm=jpg&q=60&h=800&w=800&fit=max&bg=000000';
                    });
                }, function(error) {

                });
        }

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

        $scope.$on('$locationChangeStart', function(event) {
            if ($state.current.name === 'projects') {
                $cookies.put(APICONSTANTS.authCookie.visited, 'visited');
            }
        });

        getProjects();
        getUser();
    }]);
