import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()
app.use(
    cors({
        origin: process.env.LINK_ORIGIN,
        credentials: true,
    })
)
app.use(
    express.json({
        limit: '20kb',
    })
)
app.use(
    express.urlencoded({
        extended: true,
        limit: '20kb',
    })
)
app.use(cookieParser())
console.log('We had injected cookie parser')
app.use(express.static('Public'))

// routes import section four user defined routes

import userrouter from './Routes/user.routes.js'
app.use('/user', userrouter)

//  import for community sectin

import Blogrouter from './Routes/Blog.routes.js'
app.use('/Community', Blogrouter);
import Triprouter from './Routes/Trips.routes.js'
app.use('/Trips',Triprouter)
// Basically here we had resolved a postman error that is you have to use that combined url not that which was mentioned by our sir
// Correct url : http://localhost:3000/user/register
// url which was telling bu coc is http://localhost:3000/user
export { app }
