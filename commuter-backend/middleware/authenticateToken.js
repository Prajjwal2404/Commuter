const jwt = require("jsonwebtoken")
const User = require("../models/User")
require("dotenv").config()

const JWT_SECRET = process.env.JWT_TOKEN

const authenticateToken = async (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1]
    if (!token) return res.status(401).send("Access Denied")

    try {
        const verified = jwt.verify(token, JWT_SECRET)
        const user = await User.findById(verified.id).select("username")
        if (!user) return res.status(404).send("User not found")
        req.user = user
        next()
    } catch (error) {
        res.status(403).send("Invalid Token")
    }
}

module.exports = authenticateToken