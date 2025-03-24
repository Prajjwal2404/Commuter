const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const authRoutes = require("./routes/auth")
const historyRoutes = require("./routes/history")

const app = express()
app.use(express.json())

app.use(cors())

mongoose
    .connect("mongodb://127.0.0.1:27017/commuter")
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err))

app.use("/auth", authRoutes)
app.use("/history", historyRoutes)

const PORT = 5000
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))