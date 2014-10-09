/**
 * Created by joeuser on 10/5/14.
 */

angular.module('cnpaContestApp')
    .directive('images', ['$http', 'fileImageService', '$location', function ($http, fileImageService, $location) {
        return {
            restrict: 'E',
            scope: {
                images: '=',
                contestName: '=',
                folder: '='
            },
            templateUrl: 'views/fileList.html',
            link: function (scope) {
                scope.scopeName = 'images';

                function errorCallback($scope) {
                    return function (response) {
                        console.log("error " + response.status + ": " + response.data);
                        $scope.errorMessages = [response.data];
                    }
                }

                scope.setCopyright = function(fileInfo){

                    function setCopyrightResult(response) {
                        if (response.status === 200) {
                            fileInfo.copyrightNotice.value = response.data;
                            fileInfo.copyrightNotice.title = response.data;
                            fileInfo.copyrightNotice.valid = true;
                            $location.path("/contestFiles");
                        } else {
                            errorCallback(scope)(response);
                        }
                    }

                    if (! fileInfo.copyrightNotice.valid){

                        var dateSplit = fileInfo.dateCreated.value ? fileInfo.dateCreated.value.split(':') : [],
                            year = dateSplit && dateSplit.length > 0 ? dateSplit[0] : '2014',
                            copyrightNotice = "©" + " " + year + " " + fileInfo.contestantName.value;

                        var params = {
                            rootFolder : scope.folder,
                            contestName : scope.contestName,
                            copyright : copyrightNotice,
                            filename : fileInfo.filename.value
                        };

                        $http.post('/setCopyright', params, {"Content-Type": "application/json"}).then(
                            setCopyrightResult,
                            errorCallback(scope)
                        )
                    }
                }


                scope.uploadFile = function (files) {
                    var fd = new FormData();
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
                        scope.images = fileImageService.sortUpdatedFiles(scope.images.concat(fileImageService.updateFiles(response.data)));
                    });

                }
            }
        };
    }]);