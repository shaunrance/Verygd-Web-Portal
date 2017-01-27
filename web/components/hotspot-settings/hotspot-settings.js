/* global angular, $ */
angular.module('ua5App')
    .directive('hotspotSettings', [function() {
        return {
            restrict: 'A',
            templateUrl: 'components/hotspot-settings/hotspot-settings.html',
            scope: {
                save: '=',
                cancel: '=',
                remove: '=',
                current: '=',
                scenes: '='
            },
            link: function($scope, element, attrs) {
                var $settings = $(element).find('.hotspot-settings');
                $scope.model = {type: 'scene'};

                $scope.$watch('model.type', function(value) {
                    if (value === 'scene') {
                        $scope.model.url = null;
                    } else {
                        $scope.model.sceneId = null;
                    }
                });

                $scope.$watch('current', function() {
                    var $currentSpot = $($('.hotspot').get($scope.current.index));
                    var x;
                    var width;
                    var PADDING = 10;

                    if ($currentSpot.length > 0) {

                        console.log($scope.current);

                        $scope.model = {
                            sceneId: $scope.current.sceneId,
                            url: $scope.current.url,
                            type: $scope.current.type
                        };

                        x = $currentSpot.offset().left;
                        width = $currentSpot.outerWidth();

                        if (x >  $(window).width() - (width + x)) {
                            $settings.css({
                                top: $currentSpot.offset().top,
                                left: $currentSpot.offset().left - $settings.outerWidth() - PADDING
                            });
                            $settings.addClass('left');
                        } else {
                            $settings.css({
                                top: $currentSpot.offset().top,
                                left: $currentSpot.offset().left + width + PADDING
                            });
                            $settings.removeClass('left');
                        }
                    }
                });
            }
        };
    }])
;
