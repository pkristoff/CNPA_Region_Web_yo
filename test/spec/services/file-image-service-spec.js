/**
 * Created by joeuser on 10/4/14.
 */
'use strict';

describe('Service: fileImageService', function () {

    // load the controller's module
    beforeEach(module('cnpaContestApp'));

    describe('validation', function (){


        var _isFileSizeValid,
            _isFilenameValid,
            _isDimensionValid,
            _isCopyrightValid,
            _isFileAgeValid;

        beforeEach(inject(function (fileImageService) {
            _isFileSizeValid = fileImageService._isFileSizeValid;
            _isFilenameValid = fileImageService._isFilenameValid;
            _isDimensionValid = fileImageService._isDimensionValid;
            _isCopyrightValid = fileImageService._isCopyrightValid;
            _isFileAgeValid = fileImageService._isFileAgeValid;
        }));


        describe('validation isFileSizeValid', function () {
            it('should pass validation if less than 300k', function () {
                expect(_isFileSizeValid(299 * 1024)).toBe(true);
            });       it('should pass validation if 300k', function () {
                expect(_isFileSizeValid(300 * 1024)).toBe(true);
            });       it('should fail validation if > 300', function () {
                expect(_isFileSizeValid(301 * 1024)).toBe(false);
            });
        });
        describe('validation - isFilenameValid', function () {
            it('should pass validation if xxx-yyy', function () {
                expect(_isFilenameValid("xxx-yyy")).toBe(true);
            });
            it('should fail validation if nothing after -', function () {
                expect(_isFilenameValid("xxx-")).toBe(false);
            });
            it('should fail validation if nothing before -', function () {
                expect(_isFilenameValid("-yyy")).toBe(false);
            });
            it('should fail validation if nothing before and after -', function () {
                expect(_isFilenameValid("-")).toBe(false);
            });
        });
        describe('validation - isDimensionValid', function () {
            it('should pass validation if dimension < 1024', function () {
                expect(_isDimensionValid(1023)).toBe(true);
            });
            it('should pass validation if dimension == 1024', function () {
                expect(_isDimensionValid(1024)).toBe(true);
            });
            it('should fail validation if dimension > 1024', function () {
                expect(_isDimensionValid(1025)).toBe(false);
            });
        });
        describe('validation - isCopyrightValid', function () {
            it('should fail validation if copyright is undefined', function () {
                expect(_isCopyrightValid(undefined)).toBe(false);
            });
            it('should fail validation if copyright does not contain copyright symbol', function () {
                expect(_isCopyrightValid("2013 Paul Kristoff")).toBe(false);
            });
            it('should pass validation if copyright = <copyright symbol> 2013 Paul Kristoff', function () {
                expect(_isCopyrightValid("'©' 2013 Paul Kristoff")).toBe(true);
            });
        });
        describe('validation - isFileAgeValid', function () {
            it('should fail validation if file age undefined', function () {
                expect(_isFileAgeValid(undefined)).toBe(false);
            });
            it('should pass validation if file age defined', function () {
                expect(_isFileAgeValid("xxx")).toBe(true);
            });
        });
    });

    describe('updateFiles', function(){

        var updateFiles, updateFilesResponse, updateFilesResponses;

        beforeEach(inject(function (fileImageService) {
            updateFiles = fileImageService.updateFiles;
            updateFilesResponse = [{
                filename : "xxx - yyy",
                fileSize : 299*1024,
                imageWidth : 1024,
                imageHeight : 1023,
                copyrightNotice : "'©' 2013 Paul Kristoff",
                dateCreated : "December 25, 2013"
            }];
            updateFilesResponses = [{
                filename : "zzz - yyy1",
                fileSize : 299*1024,
                imageWidth : 1024,
                imageHeight : 1023,
                copyrightNotice : "'©' 2013 Paul Kristoff",
                dateCreated : "December 25, 2013"
            },{
                filename : "yyy - yyy2",
                fileSize : 299*1024,
                imageWidth : 1024,
                imageHeight : 1023,
                copyrightNotice : "'©' 2013 Paul Kristoff",
                dateCreated : "December 25, 2013"
            },{
                filename : "xxx - yyy3",
                fileSize : 299*1024,
                imageWidth : 1024,
                imageHeight : 1023,
                copyrightNotice : "'©' 2013 Paul Kristoff",
                dateCreated : "December 25, 2013"
            }];
        }));

        describe('updateFiles', function () {
            it('should create an entry per file', function () {
                var files = updateFiles(updateFilesResponses);
                expect(files[0].title.value).toBe("yyy3")
                expect(files[1].title.value).toBe("yyy2")
                expect(files[2].title.value).toBe("yyy1")
            });

            it('should create an entry per file', function () {
                var files = updateFiles(updateFilesResponse);
                expect(files[0].filename.value).toBe("xxx - yyy");
                expect(files[0].filename.title).toBe("xxx - yyy");
                expect(files[0].filename.valid).toBe(true);

                expect(files[0].contestantName.value).toBe("xxx");
                expect(files[0].contestantName.title).toBe("xxx");
                expect(files[0].contestantName.valid).toBe(true);

                expect(files[0].title.value).toBe("yyy");
                expect(files[0].title.title).toBe("yyy");
                expect(files[0].title.valid).toBe(true);

                expect(files[0].fileSize.value).toBe('299');
                expect(files[0].fileSize.title).toBe('299');
                expect(files[0].fileSize.valid).toBe(true);

                expect(files[0].imageWidth.value).toBe(1024);
                expect(files[0].imageWidth.title).toBe(1024);
                expect(files[0].imageWidth.valid).toBe(true);

                expect(files[0].imageHeight.value).toBe(1023);
                expect(files[0].imageHeight.title).toBe(1023);
                expect(files[0].imageHeight.valid).toBe(true);

                expect(files[0].copyrightNotice.value).toBe("'©' 2013 Paul Kristoff");
                expect(files[0].copyrightNotice.title).toBe("'©' 2013 Paul Kristoff");
                expect(files[0].copyrightNotice.valid).toBe(true);

                expect(files[0].dateCreated.value).toBe("December 25, 2013");
                expect(files[0].dateCreated.title).toBe("December 25, 2013");
                expect(files[0].dateCreated.valid).toBe(true);
            });
            it('should sort the files alphabetically by filename', function () {

            })
        });
    });

});