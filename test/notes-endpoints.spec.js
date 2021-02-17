/* eslint-disable indent */
'use strict';

const {expect} = require('chai');
const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');

const {makeNotesArray, makeMaliciousNote} = require('./notes.fixtures');

describe.only('Notes Endpoints', function(){
    let db; 

    before('make knex connection', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL
        });
        app.set('db', db);
    });

    after('disconnect from db', () => db.destroy());

    before('clean up table', () => db('noteful_notes').truncate());

    afterEach('clean up table', () => db('noteful_notes').truncate());

    describe('GET /api/notes', () => {
        context('Given no notes in the database', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get('/api/notes')
                    .expect(200, []);
            });
        });

        context('Given there are notes in the database', () => {
            const testNotes = makeNotesArray(); 
    
            beforeEach('insert notes', () => {
                return db
                    .into('noteful_notes')
                    .insert(testNotes);
            });

            it('responds with 200 and all of the notes', () => {
                return supertest(app)
                    .get('/api/notes')
                    .expect(200, testNotes);
            });
        });
    });

    describe('GET /api/notes/:note_id', () => {
        context('Given there are not notes in the database', () => {
            it('responds with 404', () => {
                const noteId = 123456;

                return supertest(app)
                    .get(`/api/notes/${noteId}`)
                    .expect(404, {error: {message: 'Note doesn\'t exist'}});
            });
        });

        context('Given there are notes in the database', () => {
            const testNotes = makeNotesArray();

            beforeEach('insert notes', () => {
                return db
                    .into('noteful_notes')
                    .insert(testNotes);
            });

            it('GET /api/notes/:note_id responds with 200 and the specified note', () => {
                const noteId = 2;
                const expectedNote = testNotes[noteId -1];
        
                return supertest(app)
                    .get(`/api/notes/${noteId}`)
                    .expect(200, expectedNote);
            });
        });

        context('Given an xss attack article', () => {
            const maliciousNote = makeMaliciousNote();

            beforeEach('insert malicious article', () => {
                return db   
                    .into('noteful_notes')
                    .insert(maliciousNote);
            });

            it('removes XSS attack content', () => {
                return supertest(app)
                    .get(`/api/notes/${maliciousNote.id}`)
                    .expect(200)
                    .expect(res =>{
                        expect(res.body.note_name).to.eql('Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;');
                        expect(res.body.content).to.eql('Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.');
                    });
            });
        });
    });

    describe('POST /api/notes', () => {
        it('creates an article, responding with 201 and the new note', function(){
            this.retries(3);

            const newNote = {
                note_name: 'New Note Name',
                content: 'New Note Content'
            };

            return supertest(app)
                .post('/api/notes')
                .send(newNote)
                .expect(201)
                .expect(res => {
                    expect(res.body.note_name).to.eql(newNote.note_name);
                    expect(res.body.content).to.eql(newNote.content);
                    expect(res.body).to.have.property('id');
                    expect(res.header.location).to.eql(`/api/notes/${res.body.id}`);
                    const expected = new Date().toLocaleString(); 
                    const actual = new Date(res.body.date_published).toLocaleString();
                    expect(actual).to.eql(expected);
                })
                .then(postRes => 
                    supertest(app)
                        .get(`/api/notes/${postRes.body.id}`)
                        .expect(postRes.body)
                );
        });

        const requiredFields = ['note_name', 'content'];

        requiredFields.forEach(field => {
            const newNote = {
                note_name: 'New Note Name',
                content: 'New Note Content'
            };

            it(`responds with 400 and an error when the ${field} is missing`, () => {
                delete newNote[field];

                return supertest(app)
                    .post('/api/notes')
                    .send(newNote)
                    .expect(400, {error: {message: `Missing '${field}' in request body`}});
            });
        });
        
    });

    describe('DELETE /api/notes/:note_id', () => {
        context('Given there are notes in the database', () => {
            const testNotes = makeNotesArray();

            beforeEach('insert notes', () => {
                return db   
                    .into('noteful_notes')
                    .insert(testNotes);
            });

            it('responds with 204 and removes the note', () => {
                const idToRemove = 2;
                const expectedtNotes = testNotes.filter(note => note.id !== idToRemove);

                return supertest(app)
                    .delete(`/api/notes/${idToRemove}`)
                    .expect(204)
                    .then(res => 
                        supertest(app)
                            .get('/api/notes')
                            .expect(expectedtNotes)
                    );
            });
        });

        context('Given no notes', () => {
            it('responds with 404', () => {
                const noteId = 123456;

                return supertest(app)
                    .delete(`/api/notes/${noteId}`)
                    .expect(404, {error: {message: 'Note doesn\'t exist'}});
            });
        });
    });

    describe.only('PATCH /api/notes/:note_id', () => {
        context('Given no notes', () => {
            it('responds with 404', () => {
                const noteId = 123456;

                return supertest(app)
                    .patch(`/api/notes/${noteId}`)
                    .expect(404, {error: {message: 'Note doesn\'t exist'}});
            });
        });

        context('Given there are articles in the database', () => {
            const testNotes = makeNotesArray();

            beforeEach('insert notes', () => {
                return db   
                    .into('noteful_notes')
                    .insert(testNotes);
            });

            it('responds with 204 and updates the article', () => {
                const idToUpdate = 3;
                const updateNote = {
                    note_name: 'updated note name',
                    content: 'updated content'
                };
                const expectedNote = {
                    ...testNotes[idToUpdate -1],
                    ...updateNote
                };

                return supertest(app)
                    .patch(`/api/notes/${idToUpdate}`)
                    .send(updateNote)
                    .expect(204)
                    .then(res => 
                        supertest(app)
                            .get(`/api/notes/${idToUpdate}`)
                            .expect(expectedNote)
                    );
            });

            it('responds with 400 when no required fields supplied', () => {
                const idToUpdate = 2;

                return supertest(app)
                    .patch(`/api/notes/${idToUpdate}`)
                    .send({irrelevantField: 'foo'})
                    .expect(400, {error: {message: 'Request body must contain either \'note_name\' or \'content\''}});
            });

            it('responds with 204 when updating only a subset of fields', () => {
                const idToUpdate = 2;
                const updateNote = {
                    note_name: 'Updated Name'
                };
                const expectedNote = {
                    ...testNotes[idToUpdate - 1],
                    ...updateNote
                };

                return supertest(app)
                    .patch(`/api/notes/${idToUpdate}`)
                    .send({
                        ...updateNote,
                        fieldToIgnore: 'should not be in GET response'
                    })
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get(`/api/notes/${idToUpdate}`)
                            .expect(expectedNote)
                    );
            });
        });
    });
 
});
