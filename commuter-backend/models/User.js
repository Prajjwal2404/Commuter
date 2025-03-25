const mongoose = require("mongoose")
const bcrypt = require("bcrypt")

const historySchema = new mongoose.Schema({
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
})

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    addresses: {
        home: { type: String, default: "" },
        work: { type: String, default: "" }
    },
    history: [historySchema]
})

UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next()
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
})

const User = mongoose.model("User", UserSchema)
module.exports = User