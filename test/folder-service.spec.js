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
        before(() => {
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