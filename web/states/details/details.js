/* global angular */
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
    .controller('detailsCtrl', ['$scope', '$stateParams', 'screenFactory', function($scope, $stateParams, screenFactory) {
        $scope.screens = [];
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
            screenFactory.deleteScreen(screenId)
            
            .then(function(response) {
                    getScreens();
                }, function(error) {
                    $scope.status = 'Unable to delete screen: ' + error.message;
                });
        };

        function uploadScreens(files) {
            if (files && files.length) {
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                  
                    screenFactory.insertScreen(file, $stateParams.projectId)

                        .then(function(response) {
                                $scope.status = 'Success';
                                getScreens();
                            }, function(error) {
                                $scope.status = 'Unable to insert screen: ' + error.message;
                            });
                }
            }
        }

        function getScreens() {
            screenFactory.getScreens($stateParams.projectId)

                .then(function(response) {
                    $scope.screens = response.data.content;
                    
                }, function(error) {
                    $scope.status = 'Unable to load screen data: ' + error.message;
                });
        }

        getScreens();
    }])
;