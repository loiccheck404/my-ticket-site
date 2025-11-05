import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { convertUsdToCrypto, CryptoType } from "../services/priceConverter";
import { generatePaymentDetails } from "../services/walletGenerator";
import { checkPaymentStatus } from "../services/blockchainChecker";
import { calculateExpirationTime } from "../services/walletGenerator";

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /api/payment/create
 * Create a crypto payment for an order
 *
 * Body: {
 *   orderId: string,
 *   cryptocurrency: 'BTC' | 'ETH' | 'USDT'
 * }
 */
router.post("/create", async (req: Request, res: Response) => {
  try {
    const { orderId, cryptocurrency } = req.body;

    // Validate input
    if (!orderId || !cryptocurrency) {
      return res.status(400).json({
        success: false,
        error: "Missing orderId or cryptocurrency",
      });
    }

    if (!["BTC", "ETH", "USDT"].includes(cryptocurrency)) {
      return res.status(400).json({
        success: false,
        error: "Invalid cryptocurrency. Must be BTC, ETH, or USDT",
      });
    }

    // Get the order from database
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { orderItems: true },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // Check if order already has a transaction
    const existingTransaction = await prisma.transaction.findUnique({
      where: { orderId },
    });

    if (existingTransaction) {
      return res.status(400).json({
        success: false,
        error: "Payment already created for this order",
      });
    }

    // Convert USD amount to crypto
    const usdAmount = order.totalAmount;
    const { cryptoAmount, exchangeRate } = await convertUsdToCrypto(
      usdAmount,
      cryptocurrency as CryptoType
    );

    // Generate payment details
    const paymentDetails = generatePaymentDetails(
      orderId,
      usdAmount,
      cryptoAmount,
      exchangeRate,
      cryptocurrency as CryptoType
    );

    // Create transaction in database
    const transaction = await prisma.transaction.create({
      data: {
        orderId,
        amount: usdAmount,
        cryptocurrency,
        cryptoAmount,
        exchangeRate,
        walletAddress: paymentDetails.walletAddress,
        status: "PENDING",
        expiresAt: paymentDetails.expiresAt,
        confirmations: 0,
      },
    });

    // Update order status
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "PENDING_PAYMENT" },
    });

    console.log(`✅ Payment created for order ${orderId}`);

    // Return payment details to frontend
    res.json({
      success: true,
      payment: {
        transactionId: transaction.id,
        orderId,
        cryptocurrency,
        amount: {
          usd: usdAmount,
          crypto: cryptoAmount,
        },
        exchangeRate,
        walletAddress: paymentDetails.walletAddress,
        paymentReference: paymentDetails.paymentReference,
        qrCodeUrl: paymentDetails.qrCodeUrl,
        expiresAt: paymentDetails.expiresAt,
        network: paymentDetails.network,
      },
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create payment",
    });
  }
});

/**
 * GET /api/payment/status/:orderId
 * Get current payment status from database
 */
router.get("/status/:orderId", async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    // Get transaction from database
    const transaction = await prisma.transaction.findUnique({
      where: { orderId },
      include: {
        order: {
          include: {
            orderItems: {
              include: {
                seat: true,
                ticket: true,
              },
            },
          },
        },
      },
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: "Payment not found",
      });
    }

    // Check if payment expired
    const now = new Date();
    const isExpired = now > transaction.expiresAt;

    // If expired and still pending, mark as failed
    if (isExpired && transaction.status === "PENDING") {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: "EXPIRED" },
      });

      await prisma.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
      });

      return res.json({
        success: true,
        payment: {
          status: "EXPIRED",
          message: "Payment window expired",
        },
      });
    }

    res.json({
      success: true,
      payment: {
        transactionId: transaction.id,
        orderId: transaction.orderId,
        cryptocurrency: transaction.cryptocurrency,
        amount: {
          usd: transaction.amount,
          crypto: transaction.cryptoAmount,
        },
        exchangeRate: transaction.exchangeRate,
        walletAddress: transaction.walletAddress,
        status: transaction.status,
        confirmations: transaction.confirmations,
        txHash: transaction.txHash,
        expiresAt: transaction.expiresAt,
        confirmedAt: transaction.confirmedAt,
        createdAt: transaction.createdAt,
        // Time remaining
        timeRemaining: Math.max(
          0,
          transaction.expiresAt.getTime() - now.getTime()
        ),
      },
    });
  } catch (error) {
    console.error("Error getting payment status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get payment status",
    });
  }
});

/**
 * GET /api/payment/check/:orderId
 * Check blockchain for payment (manual trigger)
 */
router.get("/check/:orderId", async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    // Get transaction from database
    const transaction = await prisma.transaction.findUnique({
      where: { orderId },
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: "Payment not found",
      });
    }

    // Don't check if already completed or expired
    if (
      transaction.status === "COMPLETED" ||
      transaction.status === "EXPIRED"
    ) {
      return res.json({
        success: true,
        message: `Payment already ${transaction.status.toLowerCase()}`,
        payment: {
          status: transaction.status,
          confirmations: transaction.confirmations,
        },
      });
    }

    // Check blockchain for payment
    const result = await checkPaymentStatus(
      transaction.cryptocurrency as CryptoType,
      transaction.cryptoAmount,
      transaction.createdAt
    );

    console.log(`🔍 Blockchain check result for order ${orderId}:`, {
      found: result.found,
      confirmations: result.confirmations,
      isComplete: result.isComplete,
    });

    // Update transaction based on result
    if (result.found) {
      const updateData: any = {
        confirmations: result.confirmations,
      };

      // If payment is complete
      if (result.isComplete) {
        updateData.status = "COMPLETED";
        updateData.confirmedAt = new Date();
        updateData.txHash = result.transaction?.txHash;

        // Update order status
        await prisma.order.update({
          where: { id: orderId },
          data: { status: "CONFIRMED" },
        });

        // Mark seats as booked
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: { orderItems: { include: { seat: true } } },
        });

        if (order) {
          for (const item of order.orderItems) {
            if (item.seat) {
              await prisma.seat.update({
                where: { id: item.seat.id },
                data: { isBooked: true },
              });
            }
          }
        }

        console.log(`✅ Payment confirmed for order ${orderId}!`);
      } else {
        updateData.status = "CONFIRMING";
        console.log(
          `⏳ Payment found but waiting for confirmations: ${
            result.confirmations
          }/${result.confirmations + result.needsMoreConfirmations}`
        );
      }

      await prisma.transaction.update({
        where: { id: transaction.id },
        data: updateData,
      });
    }

    res.json({
      success: true,
      payment: {
        found: result.found,
        status: result.isComplete
          ? "COMPLETED"
          : result.found
          ? "CONFIRMING"
          : "PENDING",
        confirmations: result.confirmations,
        needsMoreConfirmations: result.needsMoreConfirmations,
        txHash: result.transaction?.txHash,
        message: result.found
          ? result.isComplete
            ? "Payment confirmed! Your tickets are ready."
            : `Payment received! Waiting for ${result.needsMoreConfirmations} more confirmation(s).`
          : "Waiting for payment...",
      },
    });
  } catch (error) {
    console.error("Error checking payment:", error);
    res.status(500).json({
      success: false,
      error: "Failed to check payment",
    });
  }
});

export default router;
