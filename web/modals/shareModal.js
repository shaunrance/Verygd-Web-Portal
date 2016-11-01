/* global angular, Clipboard, $ */
angular.module('ua5App')
    .controller('shareModalController', ['$scope', '$rootScope', '$element', 'fields', 'close', 'projectFactory', function($scope, $rootScope, $element, fields, close, projectFactory) {
        var clipboard = new Clipboard('.modal-submit'); //jshint ignore:line
        $scope.title = fields.title;
        $scope.formLabels = fields.formLabels;
        $scope.buttonText = fields.submitButtonText;
        $scope.email = {};
        $scope.input = {
            fields: {
                name: '',
                description: ''
            }
        };
        $scope.showFileUpload = fields.showFileUpload;
        $scope.urlShowing = true;
        $scope.projectId = fields.project;

        $scope.close = function() {
            close({
                input: $scope.input.fields
            });
        };

        $scope.switchPanel = function(panel) {
            if (panel === 'url') {
                $scope.urlShowing = true;
            } else if (panel === 'email') {
                $scope.urlShowing = false;
            }
        };

        $scope.cancel = function() {
            close({
                input: $scope.input.fields
            });
        };

        $scope.emailSubmit = function() {
            var regex = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

            if ($scope.email.address === '' || !regex.test($scope.email.address)) {
                $scope.message = 'Please enter a valid email address.';
                $('.modal-message').css({
                    opacity: 1,
                    transform: 'translateY(0)'
                });
            } else {
                window.location.href = 'mailto:' + $scope.email.address + '?subject=&body=Hello, someone has shared a Very.gd link with you. ' + $scope.project.name + ': ' + $scope.url;
                $scope.close();
            }
        };

        $scope.makePublic = function() {
            projectFactory.editProject($scope.project.id, {name: $scope.project.name, public: true}); //jshint ignore:line
            $scope.publicProject = true;
            $rootScope.$broadcast('public:true');
        };

        function init() {
            projectFactory.getProjectById($scope.projectId).then(function(response) {
                $scope.project = response.data;
                console.log($scope.project);
                $scope.url = 'projects.very.gd/' + $scope.project.short_uuid;
                if ($scope.project.public) { //jshint ignore:line
                    $scope.publicProject = true;
                } else {
                    $scope.publicProject = false;
                }
            });
        }

        init();
    }])
;
