/* eslint-disable indent */
'use strict';

const {expect} = require('chai');
const knex = require('knex'); 

const FolderService = require('../src/folder/folder-service');
const { makeFolderArray } = require('./folder.fixtures');


describe('Folder Service Object', function(){
    let db;
    let testFolder = makeFolderArray();

    before(() => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        });
    });

    before(() => db.raw('TRUNCATE noteful_notes, noteful_folder RESTART IDENTITY CASCADE'));

    afterEach(() => db.raw('TRUNCATE noteful_notes, noteful_folder RESTART IDENTITY CASCADE'));

    after(() => db.destroy());

    context('Given \'noteful_folder\' has data', () => {
        beforeEach(() => {
            return db   
                .into('noteful_folder')
                .insert(testFolder);
        });

        it('getAllFolders() resolves all folders from \'noteful_folders\' table', () => {
            return FolderService.getAllFolders(db)
                .then(actual => {
                    expect(actual).to.eql(testFolder.map(folder => ({
                        id: folder.id,
                        folder_name: folder.folder_name,
                        date_created: new Date(folder.date_created)
                    })));
                });
        });

        it('getById() resolves a folder by id from \'noteful_folder\' table', () => {
            const thirdId = 3;
            const testThirdFolder = testFolder[thirdId - 1];

            return FolderService.getById(db, thirdId)
                .then(actual => {
                    expect(actual).to.eql({
                        id: 3,
                        folder_name: testThirdFolder.folder_name,
                        date_created: new Date(testThirdFolder.date_created)
                    });
                });
        });

        it('deleteFolder() removes a folder by id from \'noteful_folder\'', () => {
            const idToRemove = 3;

            return FolderService.deleteFolder(db, idToRemove)
                .then(() => FolderService.getAllFolders(db))
                .then(allFolders => {
                    const expected = testFolder.filter(folder => folder.id !== idToRemove);
                    expect(allFolders).to.eql(expected.map(folder => ({
                        ...folder,
                        date_created: new Date(folder.date_created)
                    })));
                });
        });

        it('updateFolder() updates a folder from \'noteful_folder\'', () => {
            const idToUpdate = 3;
            const newFolderData = {
                folder_name: 'Updated Folder Name',
                date_created: new Date()
            };

            return FolderService.updateFolder(db, idToUpdate, newFolderData)
                .then(() => FolderService.getById(db, idToUpdate))
                .then(folder => {
                    expect(folder).to.eql({
                        id: idToUpdate,
                        folder_name: newFolderData.folder_name,
                        date_created: new Date(newFolderData.date_created)
                    });
                });
        });
    });

    context('Given \'noteful_folder\' has no data', () => {
        it('getAllFolders() resolves to an empty array', () => {
            return FolderService.getAllFolders(db)
                .then(actual => {
                    expect(actual).to.eql([]);
                });
        });

        it('insertFolder() inserts a new folder and resolves the new folder with an id', () => {
            const newFolder = {
                folder_name: 'New test folder',
                date_created: new Date()
            };

            return FolderService.insertFolder(db, newFolder)
                .then(actual => {
                    expect(actual).to.eql({
                        id: 1,
                        folder_name: newFolder.folder_name,
                        date_created: newFolder.date_created
                    });
                });
        });
    });
});