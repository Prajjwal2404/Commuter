const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const authRoutes = require("./routes/auth")

const app = express()
app.use(express.json())

app.use(cors())

mongoose
    .connect("mongodb://127.0.0.1:27017/auth", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err))

app.use("/auth", authRoutes)

const PORT = 5000
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))