
import express from "express"
import { aiChat, getRecords, sendandReply } from "../controllers/AIController"


const router = express.Router()


router.post("", aiChat)
router.post('/webhook', sendandReply)
router.get("/records", getRecords)

export default router