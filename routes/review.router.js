
const express = require('express')
const auth = require('../controllers/Auth.controller.js')
const { getAllReview, addReview, updateReview, deleteReview, createFilterObj, setProductId } = require('../controllers/review.controller.js')
// const verifyToken = require('../middleware/verifyToken.js')

// const router = express.Router()
const router = express.Router({ mergeParams: true });


router.route('/')
.get(createFilterObj,getAllReview)
.post(auth.protect,auth.allowedTo('user'),setProductId,addReview)

router.route('/:id')
.put(auth.protect,auth.allowedTo('user'),setProductId,updateReview)
.delete(auth.protect,auth.allowedTo(['user','admin']),deleteReview)






module.exports = router