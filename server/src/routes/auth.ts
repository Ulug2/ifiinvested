import { Router } from 'express'
import { validate, signupSchema, loginSchema } from '../middleware/validate'
import { requireAuth } from '../middleware/auth'
import * as authController from '../controllers/auth.controller'

const router = Router()

router.post('/signup', validate(signupSchema), authController.signup)
router.post('/login', validate(loginSchema), authController.login)
router.get('/me', requireAuth, authController.me)
router.patch('/onboarding', requireAuth, authController.onboarding)

export default router
