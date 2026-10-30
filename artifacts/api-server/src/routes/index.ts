import { Router, type IRouter } from "express";
import adminRouter from "./admin";
import healthRouter from "./health";
import meRouter from "./me";
import petsRouter from "./pets";
import providerProfileRouter from "./providerProfile";

const router: IRouter = Router();

router.use(healthRouter);
router.use(meRouter);
router.use(petsRouter);
router.use(providerProfileRouter);
router.use(adminRouter);

export default router;
