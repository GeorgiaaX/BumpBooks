//Create a connection to the Database
const mongoose = require("mongoose")

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(
            process.env.MONGO_URI //use MONGO_URI environment variable
        )

        console.log(`MongoDB connected: ${conn.connection.host}`)
    } catch (err) {
        console.error(err)
        //exit if err
        process.exit(1)
    }
}

//export the function
module.exports = connectDB