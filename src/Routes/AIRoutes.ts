
import express from "express"
import { aiChat, sendandReply } from "../controllers/AIController"


const router = express.Router()


router.post("", aiChat)
router.post('/webhook', sendandReply)

export default router