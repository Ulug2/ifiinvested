import { Router } from 'express'
import * as investmentController from '../controllers/investment.controller'

const router = Router()

router.get('/portfolio', investmentController.portfolio)
router.get('/projection', investmentController.projection)

export default router
