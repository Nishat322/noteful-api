/* eslint-disable indent */
'use strict';
require('dotenv').config();

module.exports = {
    'migrationsDirectory': 'migrations',
    'driver': 'pg',
    'connectionString': process.env.DB_URL,

};