/* global angular, $ */
angular.module('ua5App')
    .directive('hotspotEditor', ['panelFactory', function(panelFactory) {
        return {
            restrict: 'A',
            templateUrl: 'components/hotspot-editor/hotspot-editor.html',
            scope: {
                content: '='
            },
            link: function($scope, element, attrs) {
                var $currentHotspot;
                var $dummyHotspot;
                var $hotspotDetails;
                var $editor;

                function init() {
                    var bufferImage = new Image();

                    $scope.current = false;
                    $hotspotDetails = $(element).find('.hotspot-details');
                    $editor = $(element).find('.editor');
                    update($('.hotspot'));
                    $('.hotspot__image').on('mousedown', imageMouseDown);
                    bufferImage.onload = resize;
                    bufferImage.src = $('.hotspot__image').attr('src');
                }

                setTimeout(function() {
                    init();
                }, 1);

                function startDrag() {
                    $currentHotspot = ($(this));
                    $currentHotspot.removeClass('dropped');
                    $scope.current = false;
                    $scope.$apply();
                }

                function stopDrag() {
                    $currentHotspot.addClass('dropped');
                    $scope.$emit('hotspot:edit', getHotspotData($(this)));
                    update($(this));
                }

                $scope.$on('hotspot:reset', function(event, data) {
                    var originalData = $scope.content.hotspots[data.index];
                    if (typeof originalData === 'object') {
                        $('.hotspot[data-id="' + data.index + '"]').css({
                            left: (originalData.x * 100) + '%',
                            top: (originalData.y * 100) + '%',
                            width: (originalData.width * 100) + '%',
                            height: (originalData.height * 100) + '%'
                        });
                    }
                });

                // function positionEditorModal($hotspot) {
                //     var xPos = $hotspot.offset().left;
                //     var yPos = $hotspot.offset().top;

                //     if ($hotspot.outerWidth() + xPos + $hotspotDetails.outerHeight() > $('.hotspot__image').outerWidth()) {
                //         $hotspotDetails.css({
                //             left: (xPos - $hotspotDetails.outerWidth()) + 'px'
                //         });
                //     } else {
                //         $hotspotDetails.css({
                //             left: xPos + $hotspot.outerWidth() + 'px'
                //         });
                //     }

                //     if ($hotspot.outerHeight() + yPos < $('.hotspot__image').outerHeight() - $hotspotDetails.outerHeight()) {
                //         $hotspotDetails.css({
                //             top: (yPos) + 'px'
                //         });
                //     } else {
                //         $hotspotDetails.css({
                //             top: yPos - $hotspotDetails.outerHeight()
                //         });
                //     }
                // }

                function mousemove(event) {
                    var boxHeight = event.pageY - $dummyHotspot.offset().top;
                    var boxWidth = event.pageX - $dummyHotspot.offset().left;

                    $dummyHotspot.width(boxWidth);
                    $dummyHotspot.height(boxHeight);
                }

                function mouseUp(event) {
                    var hotspotData = getHotspotData($dummyHotspot);

                    $editor.off('mousemove', mousemove);
                    $editor.off('mouseup', mouseUp);
                    update($dummyHotspot);
                    $scope.$emit('hotspot:edit', hotspotData);
                }

                function imageMouseDown(event) {
                    $editor.on('mousemove', mousemove);
                    $editor.on('mouseup', mouseUp);

                    if ($dummyHotspot && $dummyHotspot.length > 0) {
                        $dummyHotspot.remove();
                    }

                    $dummyHotspot = $('<div class="hotspot"></div>');
                    $editor.find('.hotspot__group').append($dummyHotspot);
                    $dummyHotspot.css({
                        left: event.pageX - $('.hotspot__image').offset().left,
                        top: event.pageY - $('.hotspot__image').offset().top
                    });
                }

                function update($hotspot) {
                    $hotspot.draggable({
                        start: startDrag,
                        stop: stopDrag
                    }).resizable({
                        start: startDrag,
                        stop: stopDrag
                    });
                }

                $scope.edit = function($event) {
                    var $self = $($event.target);

                    $self.addClass('dropped');
                    $scope.$emit('hotspot:edit', getHotspotData($self));
                    update($self);
                };

                function getHotspotData($hotspot) {
                    var imageWidth = $('.hotspot__image').outerWidth();
                    var imageHeight = $('.hotspot__image').outerHeight();

                    return {
                        index: $hotspot.index(),
                        x: $hotspot.position().left / imageWidth,
                        y: $hotspot.position().top / imageHeight,
                        width: $hotspot.outerWidth() / imageWidth,
                        height: $hotspot.outerHeight() / imageHeight
                    };
                }

                function resize() {
                    $('.hotspot__group').css({
                        height: $('.hotspot__image').height() + 'px'
                    });
                }

                $scope.$watchCollection('content.hotspots', function(newVal, oldVal) {
                    update($('.hotspot'));
                });

                $scope.$on('app:resized', resize);

                $scope.$on('hotspot:cleanup', function() {
                    if ($dummyHotspot && $dummyHotspot.length > 0) {
                        $dummyHotspot.remove();
                    }
                });
            }
        };
    }])
;
