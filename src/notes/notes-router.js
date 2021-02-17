/* eslint-disable indent */
'use strict';

const express = require('express');
const NotesService = require('./notes-service');

const notesRouter = express.Router();
const jsonParser = express.json();

notesRouter
    .route('/notes')
    .get((req,res,next) => {
        const knexInstance = req.app.get('db');

        NotesService.getAllNotes(knexInstance)
            .then(notes => {
                res.json(notes);
            })
            .catch(next);
    })
    .post(jsonParser, (req,res,next) => {
        const {note_name, content} = req.body;
        const newNote = {note_name, content};
        const knexInstance = req.app.get('db');
    
        NotesService.insertNote(knexInstance, newNote)
            .then(note => {
                res 
                    .status(201)
                    .location(`/notes/${note.id}`)
                    .json(note);
            })
            .catch(next);
    });

notesRouter
    .route('/notes/:note_id')
    .get((req,res,next) => {
        const knexInstance = req.app.get('db');
        const {note_id} = req.params;

        NotesService.getById(knexInstance, note_id)
            .then(note => {
                if(!note){
                    return res
                            .status(404)
                            .json({error: {message: 'Note doesn\'t exist'}});
                }
                res.json(note);
            })
            .catch(next);
    });

module.exports = notesRouter;