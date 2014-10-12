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
                    name: '',
                    contests: [], //{rootFolder: '', name: ''}
                    directories: []  // name of directories
                };
            }

            function errorCallback($scope) {
                return function (response) {
                    var message = "error " + response.status + ": " + response.data;
                    console.log(message);
                    alert(message);
                    $scope.errorMessages = [response.data];
                }
            }

            function getContestsResult(response) {
                if (response.status === 200) {
                    $scope.contest.contests = [];
                    response.data.forEach(function (contestName, index) {
                        if (index === 0){  // select first contest by default
                            $scope.contest.name = contestName;
                        }
                        $scope.contest.contests.push({rootFolder: $scope.contest.rootFolder, name: contestName});
                    });
                    $location.path("/chooseContest");
                    return(response.data);
                } else {
                    errorCallback($scope)(response);
                }
            }

            function getContests() {

                $http.post('/getContests', $scope.contest, {"Content-Type": "application/json"}).then(
                    getContestsResult,
                    errorCallback($scope)
                );
            }

            function contestResult(response) {
                if (response.status === 200) {
                    var result = response.data;
                    $scope.contest.files = fileImageService.updateFiles(result.filenames);
                    $scope.contest.directory = result.directory;
                    $scope.contest.directories = result.directories.map(function(dirName){
                        return {value: dirName, text: dirName};
                    });
                    $location.path("/contestFiles");
                } else {
                    errorCallback($scope)(response);
                }
            }

            function createContest() {

                $http.post('/createContest', $scope.contest, {"Content-Type": "application/json"}).then(
                    contestResult,
                    errorCallback($scope)
                )
            }

            function selectContest() {

                $http.get('/contest?rootFolder=' + $scope.contest.rootFolder + "&name=" + $scope.contest.name, {
                    "Content-Type": "application/json"
                }).then(
                    contestResult,
                    errorCallback($scope)
                )
            }



            $scope.selectContest = selectContest;
            $scope.createContest = createContest;
            $scope.getContests = getContests;

            $scope._errorCallback = errorCallback;
            $scope._getContestsResult = getContestsResult;
            $scope._contestResult = contestResult;

    }]);
