/* eslint-disable indent */
'use strict';

function makeNotesArray(){
    return [
        {
            id: 1,
            note_name: 'First test note',
            content: 'Test note content',
            date_published: '2029-01-22T16:28:32.615Z',
            folder_id: 1
        },
        {
            id: 2,
            note_name: 'Second test note',
            content: 'Test note content',
            date_published: '2100-05-22T16:28:32.615Z',
            folder_id: 1

        },
        {
            id: 3,
            note_name: 'Third test note',
            content: 'Test note content',
            date_published: '1919-12-22T16:28:32.615Z',
            folder_id: 2
        }
    ];
}

function makeMaliciousNote(){
    return {
            id: 911,
            note_name: 'Naughty naughty very naughty <script>alert("xss");</script>',
            content: 'Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.'
        };
}

module.exports = {
    makeNotesArray,
    makeMaliciousNote
};