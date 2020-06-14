const express = require('express');
const { v4: uuid } = require('uuid');
const { isWebUri } = require('valid-url');
const xss = require('xss');
const logger = require('../logger');
const { bookmarks } = require('../store');
const BookmarksService = require('./bookmarks-service');

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
    .route('/bookmarks')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        BookmarksService.getAllBookmarks(knexInstance)
            .then(bookmarks => {
                res.json(bookmarks.map(serializeBookmark))
            })
            .catch(next)
    })
    .post(bodyParser, (req, res, next) => {
        const { title, url, rating, desc } = req.body;
        const newBookmark = { title, url, rating, desc}
        //loop over array and assign to var
        // for (const field of ['title', 'url', 'rating']) {
        //     if (!req.body[field]) {
        //         logger.error(`${field} is required`)
        //         return res
        //             .status(400)
        //             .send(`'${field}' is required`)
        //     }
        // }

        for (const [key, value] of Object.entries(newBookmark)) {
            if (value == null) {
                return res.status(400).send({
                    error: { message: `Missing '${key}' in request body` }
                })
            }
        }

        const ratingNum = Number(rating)

        if (!Number.isInteger(ratingNum) || ratingNum < 0 || ratingNum > 5) {
            logger.error(`Invalid rating '${rating}' supplied`)
            return res.status(400).send({ 
                error: { message: `'rating' must be a number between 0 and 5` } 
            })
        }

        if (!isWebUri(url)) {
            logger.error(`Invalid url '${url}' supplied`)
            return res.status(400).send({
                error: { message: `'url' must be a valid URL` }
            })
        }

        // const bookmark = { id: uuid(), title, url, desc, rating };
        
        // bookmarks.push(bookmark);

        BookmarksService.insertBookmark(
            req.app.get('db'),
            newBookmark
        )
            .then(bookmark => {
                logger.info(`Bookmark with id ${bookmark.id} created`);
                res
                .status(201)
                .location(`/bookmarks/${bookmark.id}`)
                .json(serializeBookmark(bookmark))
            })
            .catch(next)
        })

    bookmarksRouter
        .route('/bookmarks/:bookmark_id')
        .get((req, res, next) => {
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
        .delete((req, res, next) => {
            const { bookmark_id } = req.params;
            const knexInstance = req.app.get('db')

            BookmarksService.deleteBookmark(knexInstance, bookmark_id)
                .then(numRowsAffected => {
                    logger.info(`Bookmark with id ${bookmark_id} deleted`)
                    res.status(204).end()
                })
                .catch(next)
        });

module.exports = bookmarksRouter;