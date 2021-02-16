/* eslint-disable indent*/
'use strict';

const NotesService = {
    getAllNotes(knex) {
        return knex.select('*').from('noteful_notes');
    },

    insertNote(knex, newNote){
        return knex 
            .insert(newNote)
            .into('noteful_notes')
            .returning('*')
            .then(rows => {
                return rows[0];
            });
    }

};

module.exports = NotesService;