import { Router } from "express";
import razorpay from "razorpay"
import pg from "pg"
const router = Router();
// setup menu database
const db = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});
function getRazorpayInstance() {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        return null;
    }

    return new razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
    });
}


// routes
router.get("/", (req, res) => {
    res.send("payment")
})
router.post("/billing", async (req, res) => {
  try {
    const razorpayInstance = getRazorpayInstance();

    if (!razorpayInstance) {
      return res.status(500).json({ error: "Razorpay is not configured" });
    }

    let { items } = req.query;


    if (typeof items === "string") {
      items = items.split(",").map(Number);
    }


    const results = await Promise.all(
      items.map(item =>
        db.query("SELECT price FROM menu WHERE id=$1", [item])
      )
    );


    const totalAmount = results.reduce(
      (sum, r) => sum + Number(r.rows[0].price),
      0
    );

   
    const options = {
      amount: totalAmount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    };

    const order = await razorpayInstance.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Billing failed" });
  }
});
router.post("/verify", async (req, res) => {
  try {
    const razorpayInstance = getRazorpayInstance();

    if (!razorpayInstance) {
      return res.status(500).json({ error: "Razorpay is not configured" });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const options = {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    };

    const response = await razorpayInstance.orders.verify(options);

    if (response) {
        db.query("INSERT INTO orders (order_id, payment_id) VALUES ($1, $2)", [razorpay_order_id, razorpay_payment_id]);
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Payment verification failed" });
  }
});




export default router;
export { getRazorpayInstance };
