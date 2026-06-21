import { Router } from 'express'

const router = Router()

// Implemented in Prompt 04
router.get('/portfolio', (_req, res) => res.status(501).json({ error: 'Not implemented' }))
router.get('/projection', (_req, res) => res.status(501).json({ error: 'Not implemented' }))

export default router
