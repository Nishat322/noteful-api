/* eslint-disable indent */
'use strict';

const path = require('path');
const express = require('express');
const xss = require('xss');
const FolderService = require('./folder-service');

const folderRouter = express.Router();
const jsonParser = express.json();

const serializeFolder = folder => ({
    id: folder.id,
    folder_name: xss(folder.folder_name),
    date_created: folder.date_created
});

folderRouter
    .route('/folders')
    .get((req,res,next) => {
        const knexInstance = req.app.get('db');
        FolderService.getAllFolders(knexInstance)
            .then(folders => {
                res.json(folders.map(serializeFolder));
            });
    })
    .post(jsonParser, (req,res,next) => {
        const {folder_name} = req.body;
        const newFolder = folder_name;
        const knexInstance = req.app.get('db');

        if(!folder_name){
            return res
                    .status(400)
                    .json({error: {message: 'Folder Name is Missing'}
            });
        }
        FolderService.insertFolder(knexInstance, newFolder)
            .then(folder => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${folder.id}`))
                    .json(serializeFolder(folder));
            })
            .catch(next);
    });

folderRouter
    .route('/folders/:folder_id')
    .all((req,res,next) => {
        const knexInstance = req.app.get('db');
        const {folder_id} = req.params;
        
        FolderService.getById(knexInstance, folder_id)
            .then(folder => {
                if(!folder){
                    return res  
                        .status(404)
                        .json({error: {message: 'Folder doesn\'t exist'}});
                }
                res.folder = folder;
                next();
            })
            .catch(next);
    })
    .get((req,res,next) => {
        res 
            .json(serializeFolder(res.user));
    })
    .delete((req,res,next) => {
        const knexInstance = req.app.get('db');
        const {folder_id} = req.params;

        FolderService.deleteFolder(knexInstance, folder_id)
            .then(numRowsAffected => {
                res 
                    .status(204)
                    .end();
            })
            .catch(next);
    })
    .patch(jsonParser, (req,res,next) => {
        const {folder_name} = req.body;
        const folderToUpdate = folder_name;
        const knexInstance = req.app.get('db');
        const {folder_id} = req.params;

        if(!folder_name){
            return res  
                .status(400)
                .json({error: {message: 'Request body must contain folder_name'}});
        }

        FolderService.updateFolder(knexInstance, folder_id, folderToUpdate)
            .then(numRowsAffected => {
                res 
                    .status(204)
                    .end();
            });
    });

    module.exports = folderRouter;




