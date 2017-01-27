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
                $scope.model = {};

                $scope.$watch('current', function() {
                    var $currentSpot = $($('.hotspot').get($scope.current.index));
                    var x;
                    var width;
                    var PADDING = 10;

                    if (typeof $scope.current.sceneId !== 'undefined') {
                        $scope.model = {sceneId: $scope.current.sceneId};
                    } else {
                        $scope.model = {};
                    }

                    if ($currentSpot.length > 0) {

                        x = $currentSpot.offset().left;
                        width = $currentSpot.outerWidth();

                        if (x >  $(window).width() - (width + x)) {
                            $settings.css({
                                top: $currentSpot.offset().top,
                                left: $currentSpot.offset().left - $settings.width() - PADDING
                            });
                        } else {
                            $settings.css({
                                top: $currentSpot.offset().top,
                                left: $currentSpot.offset().left + width + PADDING
                            });
                        }
                    }
                });
            }
        };
    }])
;

