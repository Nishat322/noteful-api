/* eslint-disable */
'use strict';
require('dotenv').config();
const knex = require('knex');

const knexInstance = knex({
    client: 'pg',
    connection: process.env.TEST_DB_URL
});