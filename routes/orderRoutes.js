const express = require("express");
const router = express.Router();
const { Order, OrderItem, Product } = require("../models");
const { authenticateUser } = require("../middleware/auth");

// Create new order
router.post("/", authenticateUser, async (req, res) => {
  try {
    const { items, address, contact, phone } = req.body;

    // Calculate total amount
    let totalAmount = 0;
    for (const item of items) {
      const product = await Product.findByPk(item.product_id);
      if (!product) {
        return res
          .status(404)
          .json({ message: `Product ${item.product_id} not found` });
      }
      totalAmount += product.price * item.quantity;
    }

    // Create order
    const order = await Order.create({
      user_id: req.user.id,
      total_amount: totalAmount,
      address,
      contact,
      phone,
    });

    // Create order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
    }));

    await OrderItem.bulkCreate(orderItems);

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's orders
router.get("/my-orders", authenticateUser, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: OrderItem,
          include: [Product],
        },
      ],
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get order details
router.get("/:id", authenticateUser, async (req, res) => {
  try {
    const order = await Order.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id,
      },
      include: [
        {
          model: OrderItem,
          include: [Product],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
