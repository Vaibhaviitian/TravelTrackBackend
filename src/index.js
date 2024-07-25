import dotenv from 'dotenv'
import { app } from './app.js'
import connectDB from './DB/index.js'
dotenv.config({
    path: './.env',
})
connectDB()
    .then(() => {
      app.listen(process.env.PORT ||8000,()=>{
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
      })
    })
    .catch((e) => {
        console.error(`Connection failed in main index ${e}`);
    })
console.log(`${process.env.PORT}`)
console.log(`${process.env.MONGODB_URL}`)
console.log(`${process.env.DB_NAME}`)
