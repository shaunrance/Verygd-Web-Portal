/* global angular */
angular.module('ua5App')
    .directive('hotspotEditor', [function() {
        return {
            restrict: 'A',
            templateUrl: 'components/hotspot-editor/hotspot-editor.html',
            scope: {
                content: '=',
            },
            link: function($scope, element, attrs) {
                var $currentHotspot;
                var $dummyHotspot;
                var $hotspotDetails;
                var $editor;

                function init() {
                    $scope.current = false;
                    $hotspotDetails = $(element).find('.hotspot-details')
                    $editor = $(element).find('.editor')
                    update($('.hotspot'));
                    $('.hotspot__image').on('mousedown', imageMouseDown);
                }

                setTimeout(function() {
                    init();
                }, 1);

                function startDrag() {
                    $currentHotspot = ($(this));
                    $currentHotspot.removeClass('dropped');
                    //console.log($currentHotspot);
                    $scope.current = false;
                    $scope.$apply();
                }

                function stopDrag() {
                    $scope.current = getHotspotData($(this));
                    $scope.current.index = parseInt($(this).attr('data-id'), 10);
                    $scope.$apply();
                    $currentHotspot.addClass('dropped');
                    positionEditorModal($(this));
                    update($(this));
                }

                function positionEditorModal($hotspot) {
                    var xPos = $hotspot.offset().left;
                    var yPos = $hotspot.offset().top;

                    if ($hotspot.outerWidth() + xPos + $hotspotDetails.outerHeight() > $('.hotspot__image').outerWidth()) {
                        $hotspotDetails.css({
                            left: (xPos - $hotspotDetails.outerWidth()) + 'px'
                        });
                    } else {
                        $hotspotDetails.css({
                            left: xPos + $hotspot.outerWidth() + 'px'
                        });
                    }

                    if ($hotspot.outerHeight() + yPos < $('.hotspot__image').outerHeight() - $hotspotDetails.outerHeight()) {
                        $hotspotDetails.css({
                            top: (yPos) + 'px'
                        });
                    } else {
                        $hotspotDetails.css({
                            top: yPos - $hotspotDetails.outerHeight()
                        });
                    }
                }

                function mousemove(event) {
                    var boxHeight = event.pageY - $dummyHotspot.offset().top;
                    var boxWidth = event.pageX - $dummyHotspot.offset().left;

                    $dummyHotspot.width(boxWidth);
                    $dummyHotspot.height(boxHeight);
                }

                function mouseUp(event) {
                    var $newHotspot;
                    hotspotData = getHotspotData($dummyHotspot);
                    $editor.off('mousemove', mousemove);
                    $editor.off('mouseup', mouseUp);

                    $scope.content.hotspots.push(hotspotData);
                    $scope.$apply();
                    update($('.hotspot'));
                    $dummyHotspot.remove();
                    $scope.current = hotspotData;
                    $scope.$apply();
                    $newHotspot = $('.hotspot').last();
                    positionEditorModal($newHotspot);
                    $scope.current.index = parseInt($newHotspot.attr('data-id'), 10);
                    $scope.current.saved = false;

                }

                function imageMouseDown(event) {
                    $editor.on('mousemove', mousemove);
                    $editor.on('mouseup', mouseUp);
                    $dummyHotspot = $('<div class="hotspot"></div>');
                    $editor.append($dummyHotspot);
                    $dummyHotspot.css({left: event.pageX, top: event.pageY});
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

                function getHotspotData($hotspot) {
                    var imageWidth = $('.hotspot__image').outerWidth();
                    var imageHeight = $('.hotspot__image').outerHeight();

                    return {
                        x: $hotspot.position().left / imageWidth,
                        y: $hotspot.position().top / imageHeight,
                        width: $hotspot.outerWidth() / imageWidth,
                        height: $hotspot.outerHeight() / imageHeight
                    }
                }

                $scope.cancel = function() {
                    console.log($scope.current);
                    if (!$scope.content.hotspots[$scope.current.index].saved) {
                        $scope.content.hotspots.splice($scope.current.index, 1);
                    }
                    $scope.current = false;
                }

                $scope.save = function() {
                    console.log($scope.current.index);
                    //console.log($scope.content.hotspots[$scope.current.index]);
                    $scope.current.saved = true;
                    $scope.current = false;
                }

                $scope.delete = function() {
                    console.log('delete', $scope.current.index);
                    $scope.content.hotspots.splice($scope.current.index, 1);
                    $scope.current = false;
                }
            }
        };
    }])
;
