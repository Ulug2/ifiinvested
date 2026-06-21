import { Router } from 'express'

const router = Router()

// Implemented in Prompt 07
router.get('/state', (_req, res) => res.status(501).json({ error: 'Not implemented' }))
router.post('/milestone/read', (_req, res) => res.status(501).json({ error: 'Not implemented' }))

export default router
