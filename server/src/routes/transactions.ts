import { Router } from 'express'
import * as transactionController from '../controllers/transaction.controller'

const router = Router()

router.get('/', transactionController.list)

export default router
