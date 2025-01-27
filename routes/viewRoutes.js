const express = require('express');
const viewsContoller = require('../controllers/viewsController');

const router = express.Router();

router.get('/', viewsContoller.getOverview)
router.get('/tour/:slug', viewsContoller.getTour)

module.exports = router;