const express = require("express")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const User = require("../models/User")
const authenticateToken = require('../middleware/authenticateToken')

const router = express.Router()
const JWT_SECRET = process.env.JWT_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'



router.get("/verify", authenticateToken, (req, res) => {
    res.json({ message: "Token is valid", user: req.user.username })
})


router.post("/register", async (req, res) => {
    const { username, password } = req.body

    try {
        const user = new User({ username, password })
        await user.save()
        const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET, { expiresIn: "24h" })
        res.json({ token, user: user.username })
    } catch (error) {
        res.status(400).json({ error: error.message })
    }
})


router.post("/login", async (req, res) => {
    const { username, password } = req.body

    try {
        const user = await User.findOne({ username })
        if (!user) return res.status(404).json({ error: "User not found" })

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) return res.status(401).json({ error: "Invalid credentials" })

        const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET, { expiresIn: "24h" })
        res.json({ token, user: user.username })
    } catch (error) {
        res.status(500).json({ error: "Server error" })
    }
})

module.exports = router