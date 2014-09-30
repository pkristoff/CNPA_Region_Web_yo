'use strict';

console.log("app.js");
/**
 * @ngdoc overview
 * @name cnpaContestApp
 * @description
 * # cnpaContestApp
 *
 * Main module of the application.
 */
var app = angular
    .module('cnpaContestApp', [
        'ngCookies',
        'ngSanitize',
        'ngTouch',
        'ngRoute'
    ]);



app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    $routeProvider.
        when("/getContestFolder", { templateUrl: "views/partials/getContestFolder.html" }).
        when("/chooseContest", { templateUrl: "views/partials/chooseContest.html" }).
        when("/contestFiles", { templateUrl: "views/partials/contestFiles.html" }).
        otherwise( { redirectTo: "/getContestFolder" });
}]);

app.factory('$exceptionHandler', function () {
    return function (exception, cause) {
        alert(exception.message);
        console.log(exception.message);
        console.log(exception.stack);
//        $scope.errorMessages = [exception.message, exception.getstack()];
//            alert(exception.message);
    };
});