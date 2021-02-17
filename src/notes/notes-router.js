/* eslint-disable eqeqeq */
/* eslint-disable indent */
'use strict';

const path = require('path');
const express = require('express');
const xss = require('xss');
const NotesService = require('./notes-service');
const { json } = require('express');

const notesRouter = express.Router();
const jsonParser = express.json();

const serializeNote = note => ({
    id: note.id,
    note_name: xss(note.note_name),
    content: xss(note.content),
    date_published: note.date_published,
    folder_id: note.folder_id
});

notesRouter
    .route('/notes')
    .get((req,res,next) => {
        const knexInstance = req.app.get('db');

        NotesService.getAllNotes(knexInstance)
            .then(notes => {
                res.json(notes.map(serializeNote));
            })
            .catch(next);
    })
    .post(jsonParser, (req,res,next) => {
        const {note_name, content, folder_id} = req.body;
        const newNote = {note_name, content};
        const knexInstance = req.app.get('db');

        for(const [key, value] of Object.entries(newNote)){
            if(value == null){
                return res
                    .status(400)
                    .json({error: {message: `Missing '${key}' in request body`}});
            }
        }

        newNote.folder_id = folder_id;
    
        NotesService.insertNote(knexInstance, newNote)
            .then(note => {
                res 
                    .status(201)
                    .location(path.posix.join(req.originalUrl) + `/${note.id}`)
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
        res.json(serializeNote(res.note));
    })
    .delete((req,res,next) => {
        const {note_id} = req.params;
        const knexInstance = req.app.get('db');

        NotesService.deleteNote(knexInstance, note_id)
            .then(() => {
                res.status(204).end();
            })
            .catch(next);
    })
    .patch(jsonParser, (req,res,next) => {
        const {note_name, content} = req.body;
        const noteToUpdate = {note_name, content};
        const {note_id} = req.params;
        const knexInstance = req.app.get('db');
        
        const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length;

        if(numberOfValues === 0){
            return res      
                    .status(400)
                    .json({error: {message: 'Request body must contain either \'note_name\' or \'content\''}});
        }
        
        NotesService.updateNote(knexInstance, note_id, noteToUpdate)
            .then(numRowsAffected => {
                res.status(204).end();
            })
            .catch(next);
    });

module.exports = notesRouter;