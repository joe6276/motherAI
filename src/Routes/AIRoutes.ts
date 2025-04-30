
import express from "express"
import { aiChat, getRecords, sendandReply } from "../controllers/AIController"
import { tokenRequired } from "../middleWares/tokenRequired"


const router = express.Router()


router.post("",  aiChat)
router.post('/webhook', sendandReply)
router.get("/records", getRecords)

export default router