import { Router } from "express";
import { addUser, createAdmin, getAdmin, loginUser } from "../controllers/userController";
import { verifyAdmin } from "../middleWares/verifyAdmin";
import { verifySuperAdminToken } from "../middleWares";

const userRouter = Router()


userRouter.post("/register",verifyAdmin, addUser)
userRouter.post("/login", loginUser)
userRouter.post("/admin", verifySuperAdminToken,createAdmin)
userRouter.get("/:id", getAdmin)

export default userRouter