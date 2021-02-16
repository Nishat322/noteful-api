/* eslint-disable indent */
'use strict';
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const errorHandler = require('./errorHandler');
const NotesService = require('./notes/notes-service');

const app = express();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption));
app.use(cors());
app.use(helmet());

app.get('/', (req, res) => {
    res.send('Hello, world!');
});

app.get('/notes', (req, res, next) => {
    const knexInstance = req.app.get('db');

    NotesService.getAllNotes(knexInstance)
        .then(notes => {
            res.json(notes);
        })
        .catch(next);
});

app.get('/notes/:note_id',(req,res,next) => {
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

app.use(errorHandler);
    
module.exports = app;