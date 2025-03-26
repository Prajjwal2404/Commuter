const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const authRoutes = require("./routes/auth")
const historyRoutes = require("./routes/history")
require("dotenv").config()

const app = express()
app.use(express.json())

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}))

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err))

app.use("/auth", authRoutes)
app.use("/history", historyRoutes)

const PORT = 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))