import {
  checkPaymentStatus,
  shouldContinueChecking,
  getPaymentStatusMessage,
  PaymentCheckResult,
} from "./blockchainChecker";
import { CryptoType } from "./priceConverter";

export interface PaymentMonitorConfig {
  orderId: string;
  cryptocurrency: CryptoType;
  expectedAmount: number;
  createdAt: Date;
  expiresAt: Date;
  checkInterval: number; // milliseconds between checks
}

export type PaymentStatusCallback = (
  status: PaymentCheckResult,
  message: string
) => void;

/**
 * Monitor a payment continuously until it's confirmed or expires
 * This is useful for showing live updates to the user
 */
export class PaymentMonitor {
  private config: PaymentMonitorConfig;
  private intervalId?: NodeJS.Timeout;
  private isMonitoring: boolean = false;

  constructor(config: PaymentMonitorConfig) {
    this.config = config;
  }

  /**
   * Start monitoring the payment
   */
  async start(onStatusUpdate: PaymentStatusCallback): Promise<void> {
    if (this.isMonitoring) {
      console.log("Already monitoring this payment");
      return;
    }

    this.isMonitoring = true;
    console.log(
      `\n🎯 Starting payment monitor for order: ${this.config.orderId}`
    );
    console.log(
      `Will check every ${this.config.checkInterval / 1000} seconds\n`
    );

    // Do first check immediately
    await this.checkAndNotify(onStatusUpdate);

    // Set up interval for continuous checking
    this.intervalId = setInterval(async () => {
      await this.checkAndNotify(onStatusUpdate);
    }, this.config.checkInterval);
  }

  /**
   * Stop monitoring the payment
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    this.isMonitoring = false;
    console.log("\n⏹️  Payment monitor stopped\n");
  }

  /**
   * Check payment status and notify callback
   */
  private async checkAndNotify(callback: PaymentStatusCallback): Promise<void> {
    try {
      const result = await checkPaymentStatus(
        this.config.cryptocurrency,
        this.config.expectedAmount,
        this.config.createdAt
      );

      const message = getPaymentStatusMessage(result);
      console.log(`[${new Date().toLocaleTimeString()}] ${message}`);

      // Notify the callback
      callback(result, message);

      // Check if we should stop monitoring
      if (!shouldContinueChecking(this.config.expiresAt, result)) {
        if (result.isComplete) {
          console.log("\n✅ Payment complete! Stopping monitor.\n");
        } else {
          const now = new Date();
          if (now > this.config.expiresAt) {
            console.log("\n⏰ Payment expired! Stopping monitor.\n");
          }
        }
        this.stop();
      }
    } catch (error) {
      console.error("Error checking payment:", error);
      callback(
        {
          found: false,
          expectedAmount: this.config.expectedAmount,
          isComplete: false,
          confirmations: 0,
          needsMoreConfirmations: 1,
        },
        "Error checking payment status"
      );
    }
  }

  /**
   * Check if monitor is currently running
   */
  isRunning(): boolean {
    return this.isMonitoring;
  }
}

/**
 * Helper function to create and start a payment monitor
 * Returns the monitor instance so you can stop it later
 */
export function startPaymentMonitor(
  orderId: string,
  cryptocurrency: CryptoType,
  expectedAmount: number,
  createdAt: Date,
  expiresAt: Date,
  onStatusUpdate: PaymentStatusCallback,
  checkIntervalSeconds: number = 30
): PaymentMonitor {
  const monitor = new PaymentMonitor({
    orderId,
    cryptocurrency,
    expectedAmount,
    createdAt,
    expiresAt,
    checkInterval: checkIntervalSeconds * 1000,
  });

  monitor.start(onStatusUpdate);
  return monitor;
}
