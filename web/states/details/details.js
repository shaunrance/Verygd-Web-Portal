/* global angular, _ */
angular.module('ua5App.details', ['ngFileUpload'])
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
    .controller('detailsCtrl', ['$scope', '$stateParams', 'screenFactory', 'ModalService', function($scope, $stateParams, screenFactory, ModalService) {
        $scope.screens = [];
        $scope.currentSceneScreens = [];
        $scope.currentScene = 1;
        $scope.scenes = 1;
        $scope.emptyScene = true;
        $scope.$watch('files', function() {
            uploadScreens($scope.files);
        });
        $scope.$watch('file', function() {
            if ($scope.file !== null) {
                $scope.files = [$scope.file];
            }
        });
        $scope.log = '';
        $scope.projectId = $stateParams.projectId;
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
                        screenFactory.deleteScreen(screenId)
                                
                        .then(function(response) {
                                getScreens();
                            }, function(error) {
                                $scope.status = 'Unable to delete screen: ' + error.message;
                            });
                    }
                });
            });
        };

        function uploadScreens(files) {
            if (files && files.length) {
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                  
                    screenFactory.insertScreen(file, $stateParams.projectId, $scope.currentScene)

                        .then(function(response) {
                                $scope.status = 'Success';
                                getScreens();
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

        function getScreens() {
            screenFactory.getScreens($stateParams.projectId)

                .then(function(response) {
                    $scope.screens = response.data.content;
                    $scope.currentSceneScreens = _.where($scope.screens, {tag: $scope.currentScene.toString()});
                    _.each($scope.screens, function(screen) {
                        if (parseInt(screen.tag, 10) > $scope.scenes) {
                            $scope.scenes = parseInt(screen.tag, 10);
                        }
                    });
                    $scope.emptyScene = $scope.screens.length > 0 ? false : true;
                }, function(error) {
                    $scope.status = 'Unable to load screen data: ' + error.message;
                });
        }

        $scope.changeScene = function(scenekey) {
            $scope.currentScene = scenekey;
            $scope.currentSceneScreens = _.where($scope.screens, {tag: scenekey.toString()});
        };

        $scope.addScene = function() {
            $scope.scenes++;
        };

        $scope.getScene = function(num) {
            return new Array(num);   
        };

        $scope.$on('nav:add-scene', function() {
            $scope.addScene();
        });

        getScreens();
    }])
;
