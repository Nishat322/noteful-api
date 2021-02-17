/* eslint-disable indent */
'use strict';

const {expect} = require('chai');
const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const notesRouter = require('../src/notes/notes-router');

const {makeNotesArray} = require('./notes.fixtures');

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

    describe('GET /notes', () => {
        context('Given no notes in the database', () => {
            it('responds with 200 and an empty list', () => {
                return supertest(app)
                    .get('/notes')
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
                    .get('/notes')
                    .expect(200, testNotes);
            });
        });
    });

    describe('GET /notes/:note_id', () => {
        context('Given there are not notes in the database', () => {
            it('responds with 404', () => {
                const noteId = 123456;

                return supertest(app)
                    .get(`/notes/${noteId}`)
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

            it('GET /notes/:note_id responds with 200 and the specified note', () => {
                const noteId = 2;
                const expectedNote = testNotes[noteId -1];
        
                return supertest(app)
                    .get(`/notes/${noteId}`)
                    .expect(200, expectedNote);
            });
        });
    });

    describe.only('POST /notes', () => {
        it('creates an article, responding with 201 and the new note', function(){
            this.retries(3);

            const newNote = {
                note_name: 'New Note Name',
                content: 'New Note Content'
            };

            return supertest(app)
                .post('/notes')
                .send(newNote)
                .expect(201)
                .expect(res => {
                    expect(res.body.note_name).to.eql(newNote.note_name);
                    expect(res.body.content).to.eql(newNote.content);
                    expect(res.body).to.have.property('id');
                    expect(res.header.location).to.eql(`/notes/${res.body.id}`);
                    const expected = new Date().toLocaleString(); 
                    const actual = new Date(res.body.date_published).toLocaleString();
                    expect(actual).to.eql(expected);
                })
                .then(postRes => 
                    supertest(app)
                        .get(`/notes/${postRes.body.id}`)
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
                    .post('/notes')
                    .send(newNote)
                    .expect(400, {error: {message: `Missing '${field}' in request body`}});
            });
        });
        
    });

 
});
