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

        function getContests() {

            $http.post('/getContests', $scope.contest, {"Content-Type": "application/json"}).then(
                getContestsResult,
                errorCallback
            );
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

        function createContest() {
            $http.post('/createContest', $scope.contest, {"Content-Type": "application/json"}).then(
                createContestResult,
                errorCallback($scope)
            )
        }

        function createContestResult (response) {
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

        function selectContestResult(response){

            if (response.status === 200) {
                $scope.contest.files = fileImageService.updateFiles(response.data);
                $location.path("/contestFiles");
            } else {
                errorCallback($scope)(response);
            }
        }

        function errorCallback($scope) {
            return function (response) {
                console.log("error " + response.status + ": " + response.data);
                $scope.errorMessages = [response.data];
            }
        }

//        $scope.uploadFile = uploadFile;
        $scope.selectContest = selectContest;
        $scope.createContest = createContest;
        $scope.getContests = getContests;

//        $scope._updateFiles = updateFiles;
        $scope._errorCallback = errorCallback;
        $scope._getContestsResult = getContestsResult;
        $scope._createContestResult = createContestResult;
        $scope._selectContestResult = selectContestResult;

    }])
    .directive('images', ['$http', 'fileImageService', function($http, fileImageService) {
        return {
            restrict: 'E',
            scope: {
                images: '=files',
                contestName: '=',
                folder: '='
            },
            templateUrl: 'views/fileList.html',
            link: function (scope){
                scope.scopeName = 'images';


                scope.uploadFile = function (files)
                {
                    var fd = new FormData();
                    //Take the first selected file
                    for (var i = 0, len = files.length; i < len; i++) {
                        fd.append("file", files.item(i));
                    }
                    fd.append('rootFolder', scope.folder);
                    fd.append('name', scope.contestName);

                    $http.post('/addFiles', fd, {
                        withCredentials: true,
                        headers: {'Content-Type': undefined },
                        transformRequest: angular.identity
                    }).then(function (response) {
//                $scope.$apply(function () {
                        scope.images = scope.images.concat(fileImageService.updateFiles(response.data));
//                });
//                $scope.$broadcast("REFRESH");
//                $location.path("/contestFiles");

                    });

                }
            }
        };
    }]).service('fileImageService', [function(){


        function isFileAgeValid(date) {
            return !!date; // age is within limits.
        }

        function isCopyrightValid(copyrightNotice) {
            return !!copyrightNotice && (copyrightNotice.indexOf("©") >= 0);
        }

        function isDimensionValid(dim) {
            return dim <= 1024;
        }

        function isFilenameValid(filename) {
            var xxx = filename.split("-");
            return xxx.length == 2 && xxx[0].length > 0 && xxx[1].length > 0;
        }

        function isFileSizeValid(fileSize) {
            return ((fileSize / 1024) <= 300);
        }

        function updateFiles(rawFiles) {
            var files = [];
            rawFiles.forEach(function (fileEntry) {
                var fn = fileEntry.filename;
                var fnSplit  = fn.split("-");
                var newEntry = {
                    filename: {
                        value: fn,
                        title: fn,
                        valid: true
                    },
                    contestantName: {
                        value: fnSplit.length > 0 ? fnSplit[0].trim() : "",
                        title: fnSplit.length > 0 ? fnSplit[0].trim() : "",
                        valid: isFilenameValid(fn)
                    },
                    title: {
                        value: fnSplit.length > 1 ? fnSplit[1].trim() : "",
                        title: fnSplit.length > 1 ? fnSplit[1].trim() : "",
                        valid: isFilenameValid(fn)
                    },
                    fileSize: {
                        value: (fileEntry.fileSize / 1024).toPrecision(3),
                        title: (fileEntry.fileSize / 1024).toPrecision(3),
                        valid: isFileSizeValid(fileEntry.fileSize)
                    },
                    imageWidth: {
                        value: fileEntry.imageWidth,
                        title: fileEntry.imageWidth,
                        valid: isDimensionValid(fileEntry.imageWidth)
                    },
                    imageHeight: {
                        value: fileEntry.imageHeight,
                        title: fileEntry.imageHeight,
                        valid: isDimensionValid(fileEntry.imageHeight)
                    },
                    copyrightNotice: {
                        value: fileEntry.copyrightNotice,
                        title: fileEntry.copyrightNotice,
                        valid: isCopyrightValid(fileEntry.copyrightNotice)
                    },
                    dateCreated: {
                        value: fileEntry.dateCreated,
                        title: fileEntry.dateCreated,
                        valid: isFileAgeValid(fileEntry.dateCreated)
                    }
                };
                files.push(newEntry);
            });
            return files;
        }

        return {
            updateFiles : updateFiles,
            // testing only
            _isFileSizeValid : isFileSizeValid,
        _isFilenameValid : isFilenameValid,
        _isDimensionValid : isDimensionValid,
        _isCopyrightValid : isCopyrightValid,
        _isFileAgeValid : isFileAgeValid
        }
    }]);
