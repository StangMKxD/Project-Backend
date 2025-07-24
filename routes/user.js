const express = require('express')
const router = express.Router()
const { update, remove, list } = require('../controllers/user')
const { auth } = require('../middleware/auth')

router.get('/users',auth, list)
router.patch('/users/:userId',auth, update)
router.delete('/users/:userId',auth, remove)

module.exports = router