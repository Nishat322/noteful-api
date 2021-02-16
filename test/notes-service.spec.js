/* eslint-disable indent*/
'use strict';

const { expect } = require('chai');
const knex = require('knex');

const NotesService = require('../src/notes/notes-service');
const { makeNotesArray } = require('./notes.fixtures');


describe('Notes Service Object', function(){
    let db;
    let testNotes = makeNotesArray();

    before(() => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        });
    });

    before(() => db('noteful_notes').truncate());

    afterEach(() => db('noteful_notes').truncate());

    after(() => db.destroy());

    context('Given \'noteful_notes\' has data', () => {
        beforeEach(() => {
            return db   
                .into('noteful_notes')
                .insert(testNotes);
        });

        it('getAllNotes() resoves all notes from \'noteful_notes\' table', () => {
            return NotesService.getAllNotes(db)
                .then(notes => {
                    expect(notes).to.eql(testNotes.map(note => ({
                        id: note.id,
                        note_name: note.note_name,
                        content: note.content,
                        date_published: new Date(note.date_published),
                    })));
                });
        });

        it('getById() resolves a note by id from \'noteful_notes\' table', () => {
            const thirdId = 3;
            const testThirdNote = testNotes[thirdId - 1];

            return NotesService.getById(db, thirdId)
                .then(actual => {
                    expect(actual).to.eql({
                        id: thirdId,
                        note_name: testThirdNote.note_name,
                        content: testThirdNote.content,
                        date_published: new Date(testThirdNote.date_published)
                    });
                });
        });

        it('deleteNote() removes a note by id from \'noteful_notes\'', () => {
            const idToRemove = 3;

            return NotesService.deleteNote(db, idToRemove)
                .then(() => NotesService.getAllNotes(db))
                .then(allNotes => {
                    [
                        {
                            id: 1,
                            note_name: 'First test note',
                            content: 'Test note content',
                            date_published: new Date('2029-01-22T16:28:32.615Z'),
                        },
                        {
                            id: 2,
                            note_name: 'Second test note',
                            content: 'Test note content',
                            date_published: new Date('2100-05-22T16:28:32.615Z'),
                
                        },
                    ];
                    const expected = testNotes.filter(note => note.id !== idToRemove);
                    expect(allNotes).to.eql(expected.map(notes => ({
                        ... notes,
                        date_published: new Date(notes.date_published)
                    })));
                });  
        });

        it('updateNote() updates a note from \'noteful_notes\' table', () => {
            const idToUpdate = 3;
            const newNoteData = {
                note_name: 'Updated Note Name',
                content: 'Updated content',
                date_published: new Date(),
            };

            return NotesService.updateNote(db, idToUpdate, newNoteData)
                .then(() => NotesService.getById(db, idToUpdate))
                .then(note => {
                    expect(note).to.eql({
                        id: idToUpdate,
                        note_name: newNoteData.note_name,
                        content: newNoteData.content,
                        date_published: newNoteData.date_published
                    });
                });
        });
    });

    context('Given \'noteful_notes\' has no data', () => {
        it('getAllNotes() resolves an empty array', () => {
            return NotesService.getAllNotes(db)
                .then(actual => {
                    expect(actual).to.eql([]);
                });
        });

        it('insertNote() inserts a new note and resolves the new note with an id', () => {
            const newNote = {
                note_name: 'Third test note',
                content: 'Test note content',
                date_published: new Date('1919-12-22T16:28:32.615Z')
            };

            return NotesService.insertNote(db, newNote)
                .then(actual => {
                    expect(actual).to.eql({
                        id: 1,
                        note_name: newNote.note_name,
                        content: newNote.content,
                        date_published: newNote.date_published
                    });
                });
        });
    });
});