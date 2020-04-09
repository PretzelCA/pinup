const dotenv = require('dotenv');
const env = dotenv.config();

const logger = require('./logger.js');

if (env.error) {
    throw env.error
}

const MongoClient = require('mongodb').MongoClient;

let useUnifiedTopology = true;

MongoClient.connect(process.env.DBURL, { useUnifiedTopology: useUnifiedTopology },function (err, db) {
    logger.logDebug(`useUnifiedTopology is equal to "${useUnifiedTopology}", toggle setting to check if current setting is causing an error`);
    if (err) throw logger.logFatal('DATABASE CONNECTION ERROR', err);
    exports.dbClient = db;
});

module.exports.findDocuments = function (db, collectionName, search, callback) {
    let dbObject = db.db('pinupMessages');
    let collection = dbObject.collection(collectionName);
    collection.find(search).toArray(function (err, docs) {
        if (err) throw logger.logErr('DATABASE SEARCH ERROR', err);
        callback(docs)
    })
};

module.exports.addDocument = function (db, collectionName, object) {
    let dbObject = db.db('pinupMessages');
    let collection = dbObject.collection(collectionName);
    collection.insertOne(object, function(err) {
        if (err) throw logger.logErr('DATABASE ADDITION ERROR', err);
        logger.logDebug('1 document inserted');
    });
};

module.exports.createCollection = function (db, collectionName) {
    let dbObject = db.db('pinupMessages');
    dbObject.createCollection(collectionName, function(err) {
        if (err) throw logger.logErr('DATABASE COLLECTION CREATION ERROR', err);
        logger.logInfo(`New collection for ${collectionName}`);
    })
};