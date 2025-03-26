const express = require("express")
const User = require("../models/User")
const authenticateToken = require("../middleware/authenticateToken")

const router = express.Router()


router.get("/", authenticateToken, async (req, res) => {
    const userId = req.user._id

    try {
        const user = await User.findById(userId).select("history")
        if (!user) return res.status(404).send("User not found")

        res.json({ history: user.history })
    } catch (error) {
        res.status(500).send(error.message)
    }
})

router.post("/save", authenticateToken, async (req, res) => {
    const { origin, destination, timestamp } = req.body
    const userId = req.user._id

    try {
        const user = await User.findById(userId)
        if (!user) return res.status(404).send("User not found")

        user.history.push({ origin, destination, timestamp })
        await user.save()
        res.status(200).json({ history: user.history })
    } catch (error) {
        res.status(500).send(error.message)
    }
})

router.put("/update/:id", authenticateToken, async (req, res) => {
    const { timestamp } = req.body
    const userId = req.user._id
    const historyId = req.params.id

    try {
        const user = await User.findById(userId)
        if (!user) return res.status(404).send("User not found")

        const historyItem = user.history.id(historyId)
        if (!historyItem) return res.status(404).send("History item not found")

        historyItem.timestamp = timestamp
        await user.save()
        res.status(200).json({ history: user.history })
    } catch (error) {
        res.status(500).send(error.message)
    }
})

module.exports = router