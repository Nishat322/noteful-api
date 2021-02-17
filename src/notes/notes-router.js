/* eslint-disable eqeqeq */
/* eslint-disable indent */
'use strict';

const express = require('express');
const xss = require('xss');
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

        for(const [key, value] of Object.entries(newNote)){
            if(value == null){
                return res
                    .status(400)
                    .json({error: {message: `Missing '${key}' in request body`}});
            }
        }
    
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
    .all((req,res,next) => {
        const knexInstance = req.app.get('db');
        const {note_id} = req.params;

        NotesService.getById(knexInstance, note_id)
            .then(note => {
                if(!note){
                    return res
                            .status(404)
                            .json({error: {message: 'Note doesn\'t exist'}});
                }
                res.note = note;
                next();
            })
            .catch(next); 
    })
    .get((req,res,next) => {
        res.json({
            id: res.note.id,
            note_name: xss(res.note.note_name),
            content: xss(res.note.content),
            date_published: res.note.date_published
        });
    })
    .delete((req,res,next) => {
        const {note_id} = req.params;
        const knexInstance = req.app.get('db');

        NotesService.deleteNote(knexInstance, note_id)
            .then(() => {
                res.status(204).end();
            })
            .catch(next);
    });

module.exports = notesRouter;