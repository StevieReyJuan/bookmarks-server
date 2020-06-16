const path = require('path');
const express = require('express');
const { v4: uuid } = require('uuid');
// const { isWebUri } = require('valid-url');
const xss = require('xss');
const logger = require('../logger');
const BookmarksService = require('./bookmarks-service');
const { getBookmarkValidationError } = require('./bookmark-validator');

const bookmarksRouter = express.Router();
const bodyParser = express.json();

const serializeBookmark = bookmark => ({
    id: bookmark.id,
    title: xss(bookmark.title),
    url: bookmark.url,
    description: xss(bookmark.description),
    rating: Number(bookmark.rating),
})

bookmarksRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        BookmarksService.getAllBookmarks(knexInstance)
            .then(bookmarks => {
                res.json(bookmarks.map(serializeBookmark))
            })
            .catch(next)
    })
    .post(bodyParser, (req, res, next) => {
        const { title, url, rating, description } = req.body;
        const newBookmark = { title, url, rating, description}

        // loop over array and assign to var
        for (const field of ['title', 'url', 'rating']) {
            if (!req.body[field]) {
                logger.error(`${field} is required`)
                return res
                    .status(400)
                    .send(`'${field}' is required`)
            }
        }

        // for (const [key, value] of Object.entries(newBookmark)) {
        //     if (value == null) {
        //         return res.status(400).send({
        //             error: { message: `Missing '${key}' in request body` }
        //         })
        //     }
        // }

        const error = getBookmarkValidationError(newBookmark)

        if (error) return res.status(400).send(error)

        BookmarksService.insertBookmark(
            req.app.get('db'),
            newBookmark
        )
            .then(bookmark => {
                logger.info(`Bookmark with id ${bookmark.id} created`);
                res
                .status(201)
                .location(path.posix.join(req.originalUrl, `${bookmark.id}`))
                .json(serializeBookmark(bookmark))
            })
            .catch(next)
        })

    bookmarksRouter
        .route('/:bookmark_id')

        .all((req, res, next) => {
            const { bookmark_id } = req.params;
            const knexInstance = req.app.get('db')

            BookmarksService.getById(knexInstance, bookmark_id)
                .then(bookmark => {
                    if(!bookmark) {
                        logger.error(`Bookmark with id ${bookmark_id} not found.`)
                        return res
                            .status(404)
                            .json({
                                error: { message: `Bookmark not found`}
                            })
                    }
                    res.bookmark = bookmark
                    next()
                })
                .catch(next)
        })

        .get((req, res) => {
            res.json(serializeBookmark(res.bookmark))
        })

        .delete((req, res, next) => {
            const { bookmark_id } = req.params;
            const knexInstance = req.app.get('db')

            BookmarksService.deleteBookmark(knexInstance, bookmark_id)
                .then(numRowsAffected => {
                    logger.info(`Bookmark with id ${bookmark_id} deleted`)
                    res.status(204).end()
                })
                .catch(next)
        })

        .patch(bodyParser, (req, res, next) => {
            const { title, url, description, rating } = req.body
            const bookmarkToUpdate = { title, url, description, rating }
            const knexInstance = req.app.get('db')

            const numberOfValues = Object.values(bookmarkToUpdate).filter(Boolean).length
            if (numberOfValues === 0) {
                logger.error(`Invalid update without required fields`)
                return res.status(400).json({
                    error: {
                        message: `Request body must contain either 'title', 'url', 'desc', or 'rating'`
                    }
                })
            }

            const error = getBookmarkValidationError(bookmarkToUpdate)

            if (error) return res.status(400).send(error)

            BookmarksService.updateBookmark(knexInstance, req.params,bookmark_id, bookmarkToUpdate)
                .then(numRowsAffected => {
                    res.status(204).end()
                })
                .catch(next)
        })

module.exports = bookmarksRouter;