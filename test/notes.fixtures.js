/* eslint-disable indent */
'use strict';

function makeNotesArray(){
    return [
        {
            id: 1,
            note_name: 'First test note',
            content: 'Test note content',
            date_published: '2029-01-22T16:28:32.615Z',
        },
        {
            id: 2,
            note_name: 'Second test note',
            content: 'Test note content',
            date_published: '2100-05-22T16:28:32.615Z',

        },
        {
            id: 3,
            note_name: 'Third test note',
            content: 'Test note content',
            date_published: '1919-12-22T16:28:32.615Z',
        }
    ];
}

module.exports = {
    makeNotesArray
};