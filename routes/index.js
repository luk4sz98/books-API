const { Router } = require('express');
const DbClient = require('../database/dbClient');

const router = Router();
const dbClient = new DbClient();
const dbConnection = dbClient.createConnection();

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
