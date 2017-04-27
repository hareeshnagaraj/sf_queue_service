/// <reference path="angular.js" />
var colors = ["rgb(52, 152, 219)", "rgb(46, 204, 113)", "rgb(44, 62, 80)", "rgb(255, 152, 0)", "rgb(231, 76, 60)", "rgb(155, 89, 182)"];

angular.module('SvgMapApp').filter('map_color', [function () {
    return function (i) {

        if (angular.isNumber(i))
        {
            //return "hsl(211.5, 81.2%, " + saturation + "%)";
            return colors[i % colors.length];
        }

        return "hsl(211.5, 0%, 100%)";
    } 
}]);

// Colors
// Blue - 211.5°, 81.2, 93.7
