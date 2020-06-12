const express = require('express');
const { v4: uuid } = require('uuid');
const { isWebUri } = require('valid-url');
const logger = require('../logger');
const { bookmarks } = require('../store');
const BookmarksService = require('./bookmarks-service');

const bookmarksRouter = express.Router();
const bodyParser = express.json();

const serializeBookmark = bookmark => ({
    id: bookmark.id,
    title: bookmark.title,
    url: bookmark.url,
    description: bookmark.description,
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
    .post(bodyParser, (req, res) => {
        const { title, url, rating, desc } = req.body;
        //loop over array and assign to var
        for (const field of ['title', 'url', 'rating']) {
            if (!req.body[field]) {
                logger.error(`${field} is required`)
                return res
                    .status(400)
                    .send(`'${field}' is required`)
            }
        }

        if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
            logger.error(`Invalid rating '${rating}' supplied`)
            return res.status(400).send(`'rating' must be a number between 0 and 5`);
        }

        if (!isWebUri(url)) {
            logger.error(`Invalid url '${url}' supplied`)
            return res.status(400).send(`'url' must be a valid URL`)
        }

        const bookmark = { id: uuid(), title, url, desc, rating };
        
        bookmarks.push(bookmark);

        logger.info(`Bookmark with id ${bookmark.id} created`);

        res
            .status(201)
            .location(`http://localhost:8000/bookmarks/${bookmark.id}`)
            .json(bookmark)
    });

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
                            .send('Bookmark not found')
                    }
                    res.json(serializeBookmark(bookmark));
                })
                .catch(next)
        })
        .delete((req, res) => {
            const { bookmark_id } = req.params;

            const bookmarkIndex = bookmarks.findIndex(b => b.id === bookmark_id);

            if (bookmarkIndex === -1) {
                logger.error(`Bookmark with id ${bookmark_id} not found.`)
                return res
                    .status(404)
                    .send('Bookmark not found')
            }
            //splice(index, howMany, toAdd )
            bookmarks.splice(bookmarkIndex, 1);

            logger.info(`Bookmark with id ${bookmark_id} deleted.`)
            res
                .status(204)
                .end()
        });

module.exports = bookmarksRouter;