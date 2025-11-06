import PDFDocument from "pdfkit";
import QRCode from "qrcode";

interface TicketData {
  orderId: string;
  matchTitle: string;
  matchDate: string;
  venue: string;
  seatNumber: string;
  row: string;
  section: string;
  ticketType: string;
  price: number;
  userName: string;
  status: string;
}

export class PDFTicketGenerator {
  /**
   * Generate a ticket PDF
   */
  async generateTicket(ticketData: TicketData): Promise<PDFKit.PDFDocument> {
    const doc = new PDFDocument({ size: "A4", margin: 50 });

    // Colors
    const gold = "#FFD700";
    const black = "#000000";
    const darkGray = "#1a1a1a";

    // Generate QR code as base64
    const qrCodeData = JSON.stringify({
      orderId: ticketData.orderId,
      seat: `${ticketData.section}-${ticketData.row}-${ticketData.seatNumber}`,
      match: ticketData.matchTitle,
    });
    const qrCodeImage = await QRCode.toDataURL(qrCodeData, {
      width: 200,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFD700",
      },
    });

    // Header - Gold background
    doc.rect(0, 0, doc.page.width, 120).fill(gold);

    // Title
    doc
      .fontSize(32)
      .fillColor(black)
      .font("Helvetica-Bold")
      .text("PREMIUM TICKET", 50, 30);

    doc
      .fontSize(14)
      .fillColor(black)
      .font("Helvetica")
      .text("Official Match Entry Pass", 50, 70);

    // Match Title Section
    doc
      .fontSize(24)
      .fillColor(black)
      .font("Helvetica-Bold")
      .text(ticketData.matchTitle, 50, 150, { width: 500 });

    // Match Details
    const detailsY = 200;
    doc.fontSize(12).fillColor(darkGray).font("Helvetica");

    // Date
    doc.fillColor(gold).font("Helvetica-Bold").text("DATE:", 50, detailsY);
    doc
      .fillColor(black)
      .font("Helvetica")
      .text(this.formatDate(ticketData.matchDate), 150, detailsY);

    // Venue
    doc
      .fillColor(gold)
      .font("Helvetica-Bold")
      .text("VENUE:", 50, detailsY + 25);
    doc
      .fillColor(black)
      .font("Helvetica")
      .text(ticketData.venue, 150, detailsY + 25);

    // Divider Line
    doc
      .strokeColor(gold)
      .lineWidth(2)
      .moveTo(50, detailsY + 60)
      .lineTo(545, detailsY + 60)
      .stroke();

    // Seat Information Box
    const seatBoxY = detailsY + 80;
    doc.rect(50, seatBoxY, 250, 150).fillAndStroke(darkGray, gold);

    doc
      .fontSize(14)
      .fillColor(gold)
      .font("Helvetica-Bold")
      .text("SEAT INFORMATION", 60, seatBoxY + 15);

    const seatInfoY = seatBoxY + 45;
    doc.fontSize(11).fillColor("#ffffff");

    doc.text(`Section: ${ticketData.section}`, 60, seatInfoY);
    doc.text(`Row: ${ticketData.row}`, 60, seatInfoY + 25);
    doc.text(`Seat: ${ticketData.seatNumber}`, 60, seatInfoY + 50);
    doc.text(`Type: ${ticketData.ticketType}`, 60, seatInfoY + 75);

    // QR Code
    const qrX = 320;
    const qrY = seatBoxY;

    // QR Code box
    doc.rect(qrX, qrY, 200, 200).fillAndStroke("#ffffff", gold);

    // Add QR code image
    const qrBuffer = Buffer.from(qrCodeImage.split(",")[1], "base64");
    doc.image(qrBuffer, qrX + 10, qrY + 10, {
      width: 180,
      height: 180,
    });

    // Ticket Holder
    const holderY = seatBoxY + 170;
    doc
      .fontSize(12)
      .fillColor(gold)
      .font("Helvetica-Bold")
      .text("TICKET HOLDER:", 50, holderY);
    doc
      .fillColor(black)
      .font("Helvetica")
      .text(ticketData.userName, 50, holderY + 20);

    // Price
    doc
      .fillColor(gold)
      .font("Helvetica-Bold")
      .text("PRICE:", 50, holderY + 50);
    doc
      .fillColor(black)
      .font("Helvetica")
      .text(`$${ticketData.price.toFixed(2)}`, 50, holderY + 70);

    // Order ID
    doc
      .fontSize(10)
      .fillColor("#666666")
      .font("Helvetica")
      .text(`Order ID: ${ticketData.orderId}`, 50, holderY + 110);

    // Status Badge
    const statusX = 400;
    const statusY = holderY + 50;
    const statusColor =
      ticketData.status === "CONFIRMED" ? "#22c55e" : "#eab308";

    doc.rect(statusX, statusY, 120, 30).fill(statusColor);

    doc
      .fontSize(12)
      .fillColor("#ffffff")
      .font("Helvetica-Bold")
      .text(ticketData.status, statusX + 10, statusY + 8);

    // Footer
    const footerY = doc.page.height - 100;
    doc.rect(0, footerY, doc.page.width, 100).fill(darkGray);

    doc
      .fontSize(10)
      .fillColor(gold)
      .font("Helvetica-Bold")
      .text("IMPORTANT INFORMATION", 50, footerY + 15);

    doc
      .fontSize(8)
      .fillColor("#ffffff")
      .font("Helvetica")
      .text(
        "• Please arrive 30 minutes before the match starts\n" +
          "• Present this ticket and valid ID at the entrance\n" +
          "• Ticket is non-transferable and non-refundable\n" +
          "• Scan QR code at entry gates for verification",
        50,
        footerY + 35,
        { width: 500 }
      );

    return doc;
  }

  /**
   * Format date for display
   */
  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}
