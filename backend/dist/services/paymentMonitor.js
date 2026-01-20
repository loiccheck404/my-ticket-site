"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentMonitor = void 0;
exports.startPaymentMonitor = startPaymentMonitor;
const blockchainChecker_1 = require("./blockchainChecker");
/**
 * Monitor a payment continuously until it's confirmed or expires
 * This is useful for showing live updates to the user
 */
class PaymentMonitor {
    constructor(config) {
        this.isMonitoring = false;
        this.config = config;
    }
    /**
     * Start monitoring the payment
     */
    async start(onStatusUpdate) {
        if (this.isMonitoring) {
            console.log("Already monitoring this payment");
            return;
        }
        this.isMonitoring = true;
        console.log(`\n🎯 Starting payment monitor for order: ${this.config.orderId}`);
        console.log(`Will check every ${this.config.checkInterval / 1000} seconds\n`);
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
    stop() {
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
    async checkAndNotify(callback) {
        try {
            const result = await (0, blockchainChecker_1.checkPaymentStatus)(this.config.cryptocurrency, this.config.expectedAmount, this.config.createdAt);
            const message = (0, blockchainChecker_1.getPaymentStatusMessage)(result);
            console.log(`[${new Date().toLocaleTimeString()}] ${message}`);
            // Notify the callback
            callback(result, message);
            // Check if we should stop monitoring
            if (!(0, blockchainChecker_1.shouldContinueChecking)(this.config.expiresAt, result)) {
                if (result.isComplete) {
                    console.log("\n✅ Payment complete! Stopping monitor.\n");
                }
                else {
                    const now = new Date();
                    if (now > this.config.expiresAt) {
                        console.log("\n⏰ Payment expired! Stopping monitor.\n");
                    }
                }
                this.stop();
            }
        }
        catch (error) {
            console.error("Error checking payment:", error);
            callback({
                found: false,
                expectedAmount: this.config.expectedAmount,
                isComplete: false,
                confirmations: 0,
                needsMoreConfirmations: 1,
            }, "Error checking payment status");
        }
    }
    /**
     * Check if monitor is currently running
     */
    isRunning() {
        return this.isMonitoring;
    }
}
exports.PaymentMonitor = PaymentMonitor;
/**
 * Helper function to create and start a payment monitor
 * Returns the monitor instance so you can stop it later
 */
function startPaymentMonitor(orderId, cryptocurrency, expectedAmount, createdAt, expiresAt, onStatusUpdate, checkIntervalSeconds = 30) {
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
