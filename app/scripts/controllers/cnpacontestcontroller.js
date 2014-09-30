'use strict';

/**
 * @ngdoc function
 * @name cnpaContestApp.controller:CnpaContestController
 * @description
 * # CnpaContestController
 * Controller of the cnpaContestApp
 */
angular.module('cnpaContestApp')
    .controller('CnpaContestController', ['$scope', '$http', '$location', function ($scope, $http, $location) {
        if ($scope.contest == undefined) {
            $scope.contest = {rootFolder: '/tmp/cnpa',
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
                updateFiles(response);
                $location.path("/contestFiles");
            } else {
                errorCallback($scope)(response);
            }
        }

        function selectContest(childScope) {
            $scope.contest.name = childScope.contest.name;
            $http.get('/contest?rootFolder=' + childScope.contest.rootFolder + "&name=" + childScope.contest.name, {
                "Content-Type": "application/json"
            }).then(
                selectContestResult,
                errorCallback($scope)
            )
        }

        function selectContestResult(response){

            if (response.status === 200) {
                updateFiles(response);
                $location.path("/contestFiles");
            } else {
                errorCallback($scope)(response);
            }
        }

        function updateFiles(response) {
            var files = [];
            response.data.forEach(function (fileEntry) {
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
            $scope.contest.files = files;
        }

        function errorCallback($scope) {
            return function (response) {
                console.log("error " + response.status + ": " + response.data);
                $scope.errorMessages = [response.data];
            }
        }

        function isFileAgeValid(date) {
            return !!date; // age is within limits.
        }

        function isCopyrightValid(copyrightNotice) {
            return !!copyrightNotice && (copyrightNotice.indexOf("\\184") >= 0);
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

        function uploadFile(files) {
            var fd = new FormData();
            //Take the first selected file
            fd.append("file", files[0]);
            fd.append('rootFolder', $scope.contest.rootFolder);
            fd.append('name', $scope.contest.name);

            $http.post('/addFiles', fd, {
                withCredentials: true,
                headers: {'Content-Type': undefined },
                transformRequest: angular.identity
            }).then(function (response) {
                $location.path("/selectContest");

            });

        }

        function onFileSelect($files) {
            //$files: an array of files selected, each file has name, size, and type.
            for (var i = 0; i < $files.length; i++) {
                var file = $files[i];
                $scope.upload = $upload.upload({
                    url: '/addFiles', //upload.php script, node.js route, or servlet url
                    //method: 'POST' or 'PUT',
                    //headers: {'header-key': 'header-value'},
                    //withCredentials: true,
                    data: {myObj: $scope.myModelObj},
                    file: file // or list of files ($files) for html5 only
                    //fileName: 'doc.jpg' or ['1.jpg', '2.jpg', ...] // to modify the name of the file(s)
                    // customize file formData name ('Content-Disposition'), server side file variable name.
                    //fileFormDataName: myFile, //or a list of names for multiple files (html5). Default is 'file'
                    // customize how data is added to formData. See #40#issuecomment-28612000 for sample code
                    //formDataAppender: function(formData, key, val){}
                }).progress(function (evt) {
                    console.log('percent: ' + parseInt(100.0 * evt.loaded / evt.total));
                }).success(function (data, status, headers, config) {
                    // file is uploaded successfully
                    console.log(data);
                });
                //.error(...)
                //.then(success, error, progress);
                // access or attach event listeners to the underlying XMLHttpRequest.
                //.xhr(function(xhr){xhr.upload.addEventListener(...)})
            }
            /* alternative way of uploading, send the file binary with the file's content-type.
             Could be used to upload files to CouchDB, imgur, etc... html5 FileReader is needed.
             It could also be used to monitor the progress of a normal http post/put request with large data*/
            // $scope.upload = $upload.http({...})  see 88#issuecomment-31366487 for sample code.
        }

        $scope.onFileSelect = onFileSelect;
        $scope.uploadFile = uploadFile;
        $scope.selectContest = selectContest;
        $scope.createContest = createContest;
        $scope.getContests = getContests;

        // testing only
        $scope._isFileSizeValid = isFileSizeValid;
        $scope._isFilenameValid = isFilenameValid;
        $scope._isDimensionValid = isDimensionValid;
        $scope._isCopyrightValid = isCopyrightValid;
        $scope._isFileAgeValid = isFileAgeValid;
        $scope._updateFiles = updateFiles;
        $scope._errorCallback = errorCallback;
        $scope._getContestsResult = getContestsResult;
        $scope._createContestResult = createContestResult;
        $scope._selectContestResult = selectContestResult;

    }]);
