import { Router } from 'express'
import * as roundupController from '../controllers/roundup.controller'

const router = Router()

router.get('/summary', roundupController.summary)
router.post('/commit', roundupController.commit)

export default router
