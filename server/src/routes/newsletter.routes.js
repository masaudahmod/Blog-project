import express from "express";
import {
  getAllNewsletterSubscribers,
  subscribeNewsletter,
  unsubscribeNewsletter,
} from "../controllers/newsletter.controller";
const router = express.Router();

router
  .route("/newsletter-subscribe")
  .post(subscribeNewsletter)
  .get(getAllNewsletterSubscribers);
router.delete("/newsletter-unsubscribe", unsubscribeNewsletter);

export default router;
