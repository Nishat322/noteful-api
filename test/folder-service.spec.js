/* eslint-disable indent */
'use strict';

const {expect} = require('chai');
const knex = require('knex'); 

const FolderService = require('../src/folder/folder-service');


describe('Folder Service Object', function(){
    let db;
    let testFolder = [
        {
            id: 1,
            folder_name: 'First test folder'
        },
        {
            id: 2,
            folder_name: 'Second test folder'
        },
        {
            id: 3,
            folder_name: 'Third test folder'
        }
    ];

    before(() => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        });
    });

    before(() => db('noteful_folder').truncate());

    afterEach(() => db('noteful_folder').truncate());

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
                    expect(actual).to.eql(testFolder);
                });
        });

        it('getById() resolves a folder by id from \'noteful_folder\' table', () => {
            const thirdId = 3;
            const testThirdFolder = testFolder[thirdId - 1];

            return FolderService.getById(db, thirdId)
                .then(actual => {
                    expect(actual).to.eql({
                        id: 3,
                        folder_name: testThirdFolder.folder_name
                    });
                });
        });

        it('deleteFolder() removes a folder by id from \'noteful_folder\'', () => {
            const idToRemove = 3;

            return FolderService.deleteFolder(db, idToRemove)
                .then(() => FolderService.getAllFolders(db))
                .then(allFolders => {
                    [
                        {
                            id: 1,
                            folder_name: 'First test folder'
                        },
                        {
                            id: 2,
                            folder_name: 'Second test folder'
                        },
                        {
                            id: 3,
                            folder_name: 'Third test folder'
                        }
                    ];
                    const expected = testFolder.filter(folder => folder.id !== idToRemove);
                    expect(allFolders).to.eql(expected);
                });
        });

        it('updateFolder() updates a folder from \'noteful_folder\'', () => {
            const idToUpdate = 3;
            const newFolderData = {
                folder_name: 'Updated Folder Name'
            };

            return FolderService.updateFolder(db, idToUpdate, newFolderData)
                .then(() => FolderService.getById(db, idToUpdate))
                .then(folder => {
                    expect(folder).to.eql({
                        id: idToUpdate,
                        folder_name: newFolderData.folder_name
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
                folder_name: 'New test folder'
            };

            return FolderService.insertFolder(db, newFolder)
                .then(actual => {
                    expect(actual).to.eql({
                        id: 1,
                        folder_name: newFolder.folder_name
                    });
                });
        });
    });
});