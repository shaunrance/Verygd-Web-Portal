/* global angular */
angular.module('ua5App.details', ['ngFileUpload'])
    .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
        $stateProvider.state('projects.details', {
            url: '/{projectId}',
            templateUrl: 'states/details/details.html',
            controller: 'detailsCtrl',
            controllerAs: 'ctrl',
            data: {
                settings:{displayName:'First Project'}
            }
        });
    }])
    .controller('detailsCtrl', ['$scope', 'screenFactory', function($scope, screenFactory) {
        $scope.screens = [];
        
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
                  
                    screenFactory.insertScreen(file)

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
            screenFactory.getScreens()

                .then(function(response) {
                    $scope.screens = response.data.content;
                    
                }, function(error) {
                    $scope.status = 'Unable to load screen data: ' + error.message;
                });
        }

        getScreens();

        $scope.$watch('files', function() {
            uploadScreens($scope.files);
        });
        $scope.$watch('file', function() {
            if ($scope.file !== null) {
                $scope.files = [$scope.file];
            }
        });
        $scope.log = '';
    }])
;