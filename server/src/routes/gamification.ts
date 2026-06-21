import { Router } from 'express'

const router = Router()

// Implemented in Prompt 08
router.get('/snapshot', (_req, res) => res.status(501).json({ error: 'Not implemented' }))
router.post('/daily', (_req, res) => res.status(501).json({ error: 'Not implemented' }))

export default router
