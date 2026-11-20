
import { Request, Response } from "express";
import Stripe from "stripe";
import { ObjectId } from "mongodb";
import { getDB } from "../config/database.js";

const getStripe = () =>
  new Stripe(process.env.STRIPE_SECRET_KEY as string);

export const handleStripeWebhook = async (
  req: Request,
  res: Response
) => {
  const signature = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return res.status(400).send(
      "Missing Stripe signature or webhook secret."
    );
  }

  let event: Stripe.Event;

  // Verify Stripe webhook signature
  try {
    const stripe = getStripe();

    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      webhookSecret
    );
  } catch (error) {
    console.error("Webhook Signature Verification Failed:", error);

    return res.status(400).send("Invalid webhook signature.");
  }

  try {
    // Handle successful checkout
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.payment_status !== "paid") {
        return res.status(200).json({
          received: true,
          message: "Payment is not completed yet.",
        });
      }

      const bookingId = session.metadata?.bookingId;
      const customerEmail = session.metadata?.customerEmail;

      if (
        !bookingId ||
        !ObjectId.isValid(bookingId) ||
        !customerEmail ||
        !session.id ||
        session.amount_total === null
      ) {
        return res.status(400).send(
          "Incomplete payment information."
        );
      }

      if (session.mode !== "payment" || session.currency !== "usd") {
        return res.status(400).send(
          "Invalid payment mode or currency."
        );
      }

      const db = getDB();

      // Find the matching completed booking
      const booking = await db.collection("bookings").findOne({
        _id: new ObjectId(bookingId),
        customerEmail,
        status: "completed",
      });

      if (!booking) {
        return res.status(404).send("Booking not found.");
      }

      // Prevent another payment for an already-paid booking
      if (booking.paymentStatus === "paid") {
        return res.status(200).json({
          received: true,
          message: "Booking is already paid.",
        });
      }

      // Verify expected USD amount
      const conversionRate = Number(
        process.env.BDT_TO_USD_RATE
      );

      if (
        !Number.isFinite(conversionRate) ||
        conversionRate <= 0
      ) {
        return res.status(500).send(
          "Invalid currency conversion rate."
        );
      }

      const expectedAmount = Math.round(
        Number(booking.finalAmount) * conversionRate * 100
      );

      if (
        !Number.isFinite(expectedAmount) ||
        expectedAmount < 50 ||
        session.amount_total !== expectedAmount
      ) {
        return res.status(400).send(
          "Payment amount verification failed."
        );
      }

      const transactionId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.id;

      // Save payment record (idempotent by Stripe session ID)
      await db.collection("payments").updateOne(
        { stripeSessionId: session.id },
        {
          $setOnInsert: {
            bookingId,
            serviceTitle: booking.serviceTitle,
            customerName: booking.customerName,
            customerEmail: booking.customerEmail,
            technicianName: booking.technicianName,
            technicianEmail: booking.technicianEmail,
            amount: session.amount_total / 100,
            currency: "usd",
            transactionId,
            stripeSessionId: session.id,
            paymentStatus: "paid",
            paidAt: new Date(),
          },
        },
        { upsert: true }
      );

      // Update booking payment status
      await db.collection("bookings").updateOne(
        {
          _id: new ObjectId(bookingId),
          customerEmail,
          paymentStatus: { $ne: "paid" },
        },
        {
          $set: {
            paymentStatus: "paid",
            updatedAt: new Date(),
          },
        }
      );
    }

    return res.status(200).json({
      received: true,
    });
  } catch (error) {
    console.error("Stripe Webhook Processing Error:", error);

    return res.status(500).json({
      success: false,
      message: "Webhook processing failed.",
    });
  }
};
