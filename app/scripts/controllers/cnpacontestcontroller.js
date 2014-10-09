'use strict';

/**
 * @ngdoc function
 * @name cnpaContestApp.controller:CnpaContestController
 * @description
 * # CnpaContestController
 * Controller of the cnpaContestApp
 */
angular.module('cnpaContestApp')
    .controller('CnpaContestController', ['$scope', '$http', '$location', 'fileImageService',
        function ($scope, $http, $location, fileImageService) {
            $scope.scopeName = 'CnpaContestController';
            if ($scope.contest == undefined) {
                $scope.contest = {
                    rootFolder: '/tmp/cnpa',
                    name: 'bbb'
                };
            }

            function errorCallback($scope) {
                return function (response) {
                    console.log("error " + response.status + ": " + response.data);
                    $scope.errorMessages = [response.data];
                }
            }

            function getContestsResult(response) {
                if (response.status === 200) {
                    $scope.contests = [];
                    response.data.forEach(function (contestName) {
                        $scope.contests.push({rootFolder: $scope.contest.rootFolder, name: contestName});
                    });
                    $location.path("/chooseContest");
                    return(response.data);
                } else {
                    errorCallback(response);
                }
            }

            function getContests() {

                $http.post('/getContests', $scope.contest, {"Content-Type": "application/json"}).then(
                    getContestsResult,
                    errorCallback
                );
            }

            function createContestResult(response) {
                if (response.status === 200) {
                    $scope.contest.files = fileImageService.updateFiles(response.data);
                    $location.path("/contestFiles");
                } else {
                    errorCallback($scope)(response);
                }
            }

            function createContest() {

                $http.post('/createContest', $scope.contest, {"Content-Type": "application/json"}).then(
                    createContestResult,
                    errorCallback($scope)
                )
            }

            function selectContestResult(response) {

                if (response.status === 200) {
                    $scope.contest.files = fileImageService.updateFiles(response.data);
                    $location.path("/contestFiles");
                } else {
                    errorCallback($scope)(response);
                }
            }

            function selectContest() {

                $http.get('/contest?rootFolder=' + $scope.contest.rootFolder + "&name=" + $scope.contest.name, {
                    "Content-Type": "application/json"
                }).then(
                    selectContestResult,
                    errorCallback($scope)
                )
            }



            $scope.selectContest = selectContest;
            $scope.createContest = createContest;
            $scope.getContests = getContests;

            $scope._errorCallback = errorCallback;
            $scope._getContestsResult = getContestsResult;
            $scope._createContestResult = createContestResult;
            $scope._selectContestResult = selectContestResult;

    }]);
