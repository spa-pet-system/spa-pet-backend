import { Router } from 'express'
import { signup_get, signup_post } from '~/controllers/authController'

const router = Router()

router.get('/signup', signup_get)
router.post('/signup', signup_post)
router.get('/login', () => {})
router.post('/login', () => {})

module.exports = router
