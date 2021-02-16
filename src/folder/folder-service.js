/* eslint-disable indent*/
'use strict';

const FolderService = {
    getAllFolders(knex) {
        return knex.select('*').from('noteful_folder');
    },

    insertFolder(knex, newFolder){
        return knex 
            .insert(newFolder)
            .into('noteful_folder')
            .returning('*')
            .then(rows => {
                return rows[0];
            });
    }

};

module.exports = FolderService;