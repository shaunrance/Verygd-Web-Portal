/* global angular, Clipboard, $ */
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
        $scope.sceneId = fields.scene;
        $scope.projectPassword = '';

        $scope.close = function() {
            close({
                input: $scope.input.fields
            });
        };

        $scope.switchPanel = function(panel) {
            if (panel === 'url') {
                $scope.urlShowing = true;
            } else if (panel === 'embed') {
                $scope.urlShowing = false;
            }
        };

        $scope.cancel = function() {
            close({
                input: $scope.input.fields
            });
        };

        $scope.$watch('passwordOn', function(value) {
            if (value === false) {
                $scope.projectPassword = null;
                $scope.savePassword();
                $scope.project.password_protected = false;
            }
        });

        $scope.savePassword = function() {
            $scope.passwordSaved = false;
            if ($scope.projectPassword === '') {
                $scope.projectPassword = null;
                $scope.project.password_protected = false;
                $scope.passwordOn = false;
            }
            projectFactory.editProject($scope.project.id, {name: $scope.project.name, password: $scope.projectPassword}).then(function() {
                if ($scope.projectPassword) {
                    $scope.passwordSaved = true;
                }
            });
        };

        $scope.passwordKeyHandler = function(keyEvent) {
            if (keyEvent.which === 13) {
                $scope.savePassword();
            }
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
                window.location.href = 'mailto:' + $scope.email.address + '?subject=&body=' + $scope.project.name + ': ' + $scope.url;
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
                var scene = '';
                $scope.project = response.data;

                if ($scope.project.content.length > 0) {
                    scene = '/' + $scope.project.content[0].id;
                }

                $scope.url = window.location.protocol + '//' + window.location.host + '/p/' + $scope.project.short_uuid + scene;
                if ($scope.project.public) { //jshint ignore:line
                    $scope.publicProject = true;
                } else {
                    $scope.publicProject = false;
                }

                $scope.passwordOn = $scope.project.password_protected;
            });
        }

        init();
    }])
;
