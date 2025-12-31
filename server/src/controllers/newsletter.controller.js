import { createSubscription, findByEmail } from "../models/newsletter.model.js";

export const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    // basic validation
    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    // check already subscribed
    const existingEmail = await findByEmail(email);
    if (existingEmail) {
      return res.status(409).json({
        message: "Email already subscribed",
      });
    }

    // save email
    const subscription = await createSubscription(email);

    console.log("New Newsletter Subscription:", subscription);

    return res.status(201).json({
      message: "Subscribed successfully",
      data: subscription,
    });
  } catch (error) {
    console.error("Newsletter Error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

/* =========================
   Unsubscribe Controller
   ========================= */
export const unsubscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const deleted = await deleteByEmail(email);

    if (!deleted) {
      return res.status(404).json({
        message: "Email not found",
      });
    }

    console.log("Unsubscribed Email:", deleted.email);

    return res.status(200).json({
      message: "Unsubscribed successfully",
    });
  } catch (error) {
    console.error("Unsubscribe Error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

/* =========================
   Get All Subscribers
   ========================= */
export const getAllNewsletterSubscribers = async (req, res) => {
  try {
    const subscribers = await getAllSubscribers();

    return res.status(200).json({
      total: subscribers.length,
      data: subscribers,
    });
  } catch (error) {
    console.error("Get Subscribers Error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

/* =========================
   Get Subscriber By Email
   ========================= */
export const getSubscriberByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const subscriber = await findByEmail(email);

    if (!subscriber) {
      return res.status(404).json({
        message: "Email not found",
      });
    }

    return res.status(200).json({
      data: subscriber,
    });
  } catch (error) {
    console.error("Get Subscriber By Email Error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
