const express = require("express")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const User = require("../models/User")
const authenticateToken = require("../middleware/authenticateToken")
require('dotenv').config()

const router = express.Router()
const JWT_SECRET = process.env.JWT_TOKEN


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
        res.status(400).send(error.message)
    }
})


router.post("/login", async (req, res) => {
    const { username, password } = req.body

    try {
        const user = await User.findOne({ username })
        if (!user) return res.status(404).send("User not found")

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) return res.status(401).send("Invalid credentials")

        const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET, { expiresIn: "24h" })
        res.json({ token, user: user.username })
    } catch (error) {
        res.status(500).send(error.message)
    }
})


router.get("/addresses", authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("addresses")
        res.json({ addresses: user.addresses })
    } catch (error) {
        res.status(500).send(error.message)
    }
})


router.post("/addresses", authenticateToken, async (req, res) => {
    const { home, work } = req.body

    try {
        const user = await User.findById(req.user._id)

        if (!user) return res.status(404).send("User not found")

        user.addresses = { home, work }
        await user.save()

        res.status(200).json({ addresses: user.addresses })
    } catch (error) {
        res.status(500).send(error.message)
    }
})

module.exports = router