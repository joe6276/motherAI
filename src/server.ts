import express, { json,Request,Response } from 'express'
import router from './Routes/AIRoutes'
import './controllers/telegramBot'
const app = express()
app.use(express.urlencoded({ extended: false }));

app.use(json())

app.use('/aiChat',router)
app.use("/test", (req:Request, res:Response)=>{
res.status(200).send("<h1> Hello There</h1>")
})


app.listen(4000, ()=>{
    console.log("App Running...");
    
})

