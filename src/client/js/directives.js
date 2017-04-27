/// <reference path="angular.js" />
angular.module('SvgMapApp').directive('svgMap', ['$compile', function ($compile) {
    return {
        restrict: 'A',
        templateUrl: 'img/Blank_US_Map.svg',
        link: function (scope, element, attrs) {
            var regions = element[0].querySelectorAll('.state');
            angular.forEach(regions, function(path, key) {
                var regionElement = angular.element(path);
                regionElement.attr("region", "");
                regionElement.attr("states", "states");
                regionElement.attr("results", "results");
                regionElement.attr("hover-region", "hoverRegion");
                $compile(regionElement)(scope);
            });
        }
    }
}]);

angular.module('SvgMapApp').directive('region', ['$compile', function ($compile) {
    return {
        restrict: 'A',
        scope: {
            states: "=",
            results: "=",
            hoverRegion: "="
        },
        link: function (scope, element, attrs) {
            scope.elementId = element.attr("id").toLowerCase();

            scope.regionClick = function () {
                console.log(scope.results[scope.elementId]);
                alert(scope.results[scope.elementId]);
            };
            scope.regionMouseOver = function () {
                scope.hoverRegion = scope.elementId;
                element[0].parentNode.appendChild(element[0]);
            };
            element.attr("ng-click", "regionClick()");
            element.attr("ng-attr-fill", "{{(results[elementId] && results[elementId].conference) | map_color}}");
            element.attr("ng-mouseover", "regionMouseOver()");
            element.attr("ng-class", "{active:hoverRegion==elementId}");
            element.removeAttr("region");
            $compile(element)(scope);
        }
    }
}]);
