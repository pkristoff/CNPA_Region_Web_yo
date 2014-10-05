/**
 * Created by joeuser on 10/5/14.
 */

angular.module('cnpaContestApp')
    .service('fileImageService', [function () {


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
            var filenameSplit = filename.split("-");
            return filenameSplit.length == 2 && filenameSplit[0].length > 0 && filenameSplit[1].length > 0;
        }

        function isFileSizeValid(fileSize) {
            return ((fileSize / 1024) <= 300);
        }

        function sortByKey(array, key) {
            return array.sort(function (a, b) {
                var x = a[key].value;
                var y = b[key].value;
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            });
        }

        function sortUpdatedFiles(updatedFiles) {
            return sortByKey(updatedFiles, 'filename');
        }

        function updateFiles(rawFiles) {
            var files = [];
            rawFiles.forEach(function (fileEntry) {
                var fn = fileEntry.filename;
                var fnSplit = fn.split("-");
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
            return sortUpdatedFiles(files);
        }

        return {
            updateFiles: updateFiles,
            sortUpdatedFiles : sortUpdatedFiles,
            // testing only
            _isFileSizeValid: isFileSizeValid,
            _isFilenameValid: isFilenameValid,
            _isDimensionValid: isDimensionValid,
            _isCopyrightValid: isCopyrightValid,
            _isFileAgeValid: isFileAgeValid
        }
    }]);