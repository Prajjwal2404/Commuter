const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

const authenticateToken = async (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1]
    if (!token) return res.status(401).send("Access Denied")

    try {
        const verified = jwt.verify(token, JWT_SECRET)
        const userId = verified.id
        const username = await User.findById(userId).select("username")
        req.user = username
        next()
    } catch (error) {
        res.status(403).send("Invalid Token")
    }
};

module.exports = authenticateToken