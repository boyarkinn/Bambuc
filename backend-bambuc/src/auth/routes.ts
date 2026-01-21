import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User } from '../db/models/index.js'

const router = Router()

function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET is not set')
  }
  return secret
}

function signToken(user: { id: string; email: string }) {
  return jwt.sign({ sub: user.id, email: user.email }, getJwtSecret(), { expiresIn: '7d' })
}

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body ?? {}

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' })
    }

    const normalizedEmail = String(email).toLowerCase().trim()
    const existing = await User.findOne({ email: normalizedEmail }).lean()
    if (existing) {
      return res.status(409).json({ error: 'email already in use' })
    }

    const passwordHash = await bcrypt.hash(String(password), 10)
    const user = await User.create({ email: normalizedEmail, passwordHash, name })

    return res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token: signToken({ id: user.id, email: user.email })
    })
  } catch (error) {
    console.error('[auth.register] error', error)
    return res.status(500).json({ error: 'internal server error' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body ?? {}

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' })
    }

    const normalizedEmail = String(email).toLowerCase().trim()
    const user = await User.findOne({ email: normalizedEmail })
    if (!user) {
      return res.status(401).json({ error: 'invalid credentials' })
    }

    const valid = await bcrypt.compare(String(password), user.passwordHash)
    if (!valid) {
      return res.status(401).json({ error: 'invalid credentials' })
    }

    return res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token: signToken({ id: user.id, email: user.email })
    })
  } catch (error) {
    console.error('[auth.login] error', error)
    return res.status(500).json({ error: 'internal server error' })
  }
})

export const authRouter = router
