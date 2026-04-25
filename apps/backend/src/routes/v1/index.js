const express = require('express');
const router = express.Router();

// Mount auth token routes
router.use('/auth/token', require('./auth/token.routes'));

// Other routes will be mounted here in Phase 3+
// router.use('/auth/patient', require('./auth/patient.routes'));

module.exports = router;
