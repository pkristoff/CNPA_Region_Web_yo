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
            copyrightNotice : "'©' 2013 Paul Kristoff",
            dateCreated : "December 25, 2013"
        }],
            status: 200};
    }));

    it('should initialize scope.contest to default value', function () {
        expect(scope.contest).not.toBeUndefined();
        expect(scope.contest.rootFolder).toBe('/tmp/cnpa');
        expect(scope.contest.name).toBe('bbb');
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
