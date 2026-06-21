import 'dotenv/config'
import { createApp } from './app'

const secret = process.env.JWT_SECRET
if (!secret || secret.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters')
}

const port = Number(process.env.PORT) || 3001
const app = createApp()

app.listen(port, () => {
  console.log(`Server running on port ${port} [${process.env.NODE_ENV ?? 'development'}]`)
})
