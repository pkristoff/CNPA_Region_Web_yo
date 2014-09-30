'use strict';

describe('Controller: CnpaContestController', function () {

    // load the controller's module
    beforeEach(module('cnpaContestApp'));

    var CnpaContestController,
        scope,
        updateFilesResponse;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        CnpaContestController = $controller('CnpaContestController', {
            $scope: scope
        });
        updateFilesResponse = {data : [{
            filename : "xxx - yyy",
            fileSize : 299*1024,
            imageWidth : 1024,
            imageHeight : 1023,
            copyrightNotice : "\\184 2013 Paul Kristoff",
            dateCreated : "December 25, 2013"
        }],
            status: 200};
    }));

    it('should initialize scope.contest to default value', function () {
        expect(scope.contest).not.toBeUndefined();
        expect(scope.contest.rootFolder).toBe('/tmp/cnpa');
        expect(scope.contest.name).toBe('bbb');
    });

    describe('validation isFileSizeValid', function () {
        it('should pass validation if less than 300k', function () {
            expect(scope._isFileSizeValid(299 * 1024)).toBe(true);
        });       it('should pass validation if 300k', function () {
            expect(scope._isFileSizeValid(300 * 1024)).toBe(true);
        });       it('should fail validation if > 300', function () {
            expect(scope._isFileSizeValid(301 * 1024)).toBe(false);
        });
    });
    describe('validation - isFilenameValid', function () {
       it('should pass validation if xxx-yyy', function () {
            expect(scope._isFilenameValid("xxx-yyy")).toBe(true);
        });
       it('should fail validation if nothing after -', function () {
            expect(scope._isFilenameValid("xxx-")).toBe(false);
        });
       it('should fail validation if nothing before -', function () {
            expect(scope._isFilenameValid("-yyy")).toBe(false);
        });
       it('should fail validation if nothing before and after -', function () {
            expect(scope._isFilenameValid("-")).toBe(false);
        });
    });
    describe('validation - isDimensionValid', function () {
        it('should pass validation if dimension < 1024', function () {
            expect(scope._isDimensionValid(1023)).toBe(true);
        });
        it('should pass validation if dimension == 1024', function () {
            expect(scope._isDimensionValid(1024)).toBe(true);
        });
        it('should fail validation if dimension > 1024', function () {
            expect(scope._isDimensionValid(1025)).toBe(false);
        });
    });
    describe('validation - isCopyrightValid', function () {
        it('should fail validation if copyright is undefined', function () {
            expect(scope._isCopyrightValid(undefined)).toBe(false);
        });
        it('should fail validation if copyright does not contain copyright symbol', function () {
            expect(scope._isCopyrightValid("2013 Paul Kristoff")).toBe(false);
        });
        it('should pass validation if copyright = <copyright symbol> 2013 Paul Kristoff', function () {
            expect(scope._isCopyrightValid("\\184 2013 Paul Kristoff")).toBe(true);
        });
    });
    describe('validation - isFileAgeValid', function () {
        it('should fail validation if file age undefined', function () {
            expect(scope._isFileAgeValid(undefined)).toBe(false);
        });
        it('should pass validation if file age defined', function () {
            expect(scope._isFileAgeValid("xxx")).toBe(true);
        });
    });
    describe('updateFiles', function () {
        it('should create an entry per file', function () {
            scope._updateFiles(updateFilesResponse);
            expect(scope.contest.files[0].filename.value).toBe("xxx - yyy");
            expect(scope.contest.files[0].filename.title).toBe("xxx - yyy");
            expect(scope.contest.files[0].filename.valid).toBe(true);

            expect(scope.contest.files[0].contestantName.value).toBe("xxx");
            expect(scope.contest.files[0].contestantName.title).toBe("xxx");
            expect(scope.contest.files[0].contestantName.valid).toBe(true);

            expect(scope.contest.files[0].title.value).toBe("yyy");
            expect(scope.contest.files[0].title.title).toBe("yyy");
            expect(scope.contest.files[0].title.valid).toBe(true);

            expect(scope.contest.files[0].fileSize.value).toBe('299');
            expect(scope.contest.files[0].fileSize.title).toBe('299');
            expect(scope.contest.files[0].fileSize.valid).toBe(true);

            expect(scope.contest.files[0].imageWidth.value).toBe(1024);
            expect(scope.contest.files[0].imageWidth.title).toBe(1024);
            expect(scope.contest.files[0].imageWidth.valid).toBe(true);

            expect(scope.contest.files[0].imageHeight.value).toBe(1023);
            expect(scope.contest.files[0].imageHeight.title).toBe(1023);
            expect(scope.contest.files[0].imageHeight.valid).toBe(true);

            expect(scope.contest.files[0].copyrightNotice.value).toBe("\\184 2013 Paul Kristoff");
            expect(scope.contest.files[0].copyrightNotice.title).toBe("\\184 2013 Paul Kristoff");
            expect(scope.contest.files[0].copyrightNotice.valid).toBe(true);

            expect(scope.contest.files[0].dateCreated.value).toBe("December 25, 2013");
            expect(scope.contest.files[0].dateCreated.title).toBe("December 25, 2013");
            expect(scope.contest.files[0].dateCreated.valid).toBe(true);
        });
        it('should pass validation if file age defined', function () {
            expect(scope._isFileAgeValid("xxx")).toBe(true);
        });
    });
    describe('errorCallback', function () {
        it('should set errorMessages', function () {
            var response = {data: 'foo'};
            scope._errorCallback(scope)(response);
            expect(scope.errorMessages).toEqual(['foo']);
        });
    });
    describe('getContestsResult', function () {
        it('should set contests', function () {
            var response = {data: ['newName'], status: 200};
            scope.contest.rootFolder='root';
            scope._getContestsResult(response);
            expect(scope.contests).toEqual([{rootFolder:'root', name:'newName'}]);
        });
    });
    describe('createContestResult', function () {
        it('should set contests', function () {
            var response = {data: ['newName'], status: 200};
            scope.contest.rootFolder='root';
            scope._getContestsResult(response);
            expect(scope.contests).toEqual([{rootFolder:'root', name:'newName'}]);
        });
    });
    describe('createContestResult', function () {
        it('should call updateFiles', function () {
            scope._createContestResult(updateFilesResponse);
            expect(scope.contest.files[0].filename.value).toBe("xxx - yyy"); // updateFiles was called
        });
    });
    describe('selectContestResult', function () {
        it('should call updateFiles', function () {
            scope._selectContestResult(updateFilesResponse);
            expect(scope.contest.files[0].filename.value).toBe("xxx - yyy"); // updateFiles was called
        });
    });
});
