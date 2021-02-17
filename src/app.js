/* eslint-disable indent */
'use strict';
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');

const { NODE_ENV } = require('./config');
const notesRouter = require('./notes/notes-router');
const errorHandler = require('./errorHandler');


const app = express();
const jsonParser = express.json();

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption));
app.use(cors());
app.use(helmet());

app.get('/', (req, res) => {
    res.send('Hello, world!');
});

app.use('/api', notesRouter);
app.use(errorHandler);
    
module.exports = app;