import { Router } from 'express'

const router = Router()

// Implemented in Prompt 04
router.get('/summary', (_req, res) => res.status(501).json({ error: 'Not implemented' }))
router.post('/commit', (_req, res) => res.status(501).json({ error: 'Not implemented' }))

export default router
