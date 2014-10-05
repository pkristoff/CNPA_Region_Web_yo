/**
 * Created by joeuser on 10/5/14.
 */

angular.module('cnpaContestApp')
    .directive('images', ['$http', 'fileImageService', function ($http, fileImageService) {
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