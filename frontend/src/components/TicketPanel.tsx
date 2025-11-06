"use client";

import { useEffect, useState } from "react";

interface Seat {
  seatNumber: string;
  row: string;
  section: string;
}

interface Match {
  id: string;
  title: string;
  date: string;
  venue: string;
  imageUrl: string;
}

interface Ticket {
  ticketType: string;
  price: number;
  match: Match;
  seat: Seat | null;
}

interface Order {
  orderId: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  tickets: Ticket[];
}

interface TicketPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function TicketPanel({
  isOpen,
  onClose,
  userId,
}: TicketPanelProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && userId) {
      fetchOrders();
    }
  }, [isOpen, userId]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/orders/user/${userId}`
      );
      const data = await response.json();

      if (data.success) {
        // Get only the 3 most recent orders
        setOrders(data.orders.slice(0, 3));
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "CONFIRMED":
      case "COMPLETED":
        return "bg-green-500";
      case "PENDING":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-96 bg-gradient-to-b from-gray-900 to-black border-l border-[#FFD700] z-50 shadow-2xl transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#FFD700]">My Tickets</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto h-[calc(100vh-180px)]">
          {loading ? (
            <p className="text-gray-400 text-center">Loading...</p>
          ) : orders.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">No tickets yet</p>
              <button
                onClick={() => (window.location.href = "/")}
                className="px-4 py-2 bg-[#FFD700] text-black font-bold rounded hover:bg-yellow-500 transition"
              >
                Browse Matches
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) =>
                order.tickets.map((ticket, idx) => (
                  <div
                    key={`${order.orderId}-${idx}`}
                    className="bg-black/50 border border-gray-700 rounded-lg p-4 hover:border-[#FFD700] transition"
                  >
                    {/* Status Badge */}
                    <div className="flex justify-between items-start mb-2">
                      <span
                        className={`${getStatusColor(
                          order.status
                        )} text-white text-xs px-2 py-1 rounded font-bold`}
                      >
                        {order.status}
                      </span>
                    </div>

                    {/* Match Info */}
                    <h3 className="text-[#FFD700] font-bold text-lg">
                      {ticket.match.title}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                      📅 {formatDate(ticket.match.date)}
                    </p>
                    <p className="text-gray-400 text-sm">
                      📍 {ticket.match.venue}
                    </p>

                    {/* Seat Info */}
                    {ticket.seat && (
                      <p className="text-white text-sm mt-2">
                        🎫 {ticket.seat.section} - Row {ticket.seat.row} - Seat{" "}
                        {ticket.seat.seatNumber}
                      </p>
                    )}

                    {/* Price */}
                    <p className="text-[#FFD700] font-bold mt-2">
                      {ticket.ticketType} - ${ticket.price}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer - View All Button */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-700 bg-gray-900">
          <button
            onClick={() => (window.location.href = "/dashboard")}
            className="w-full bg-[#FFD700] text-black font-bold py-3 rounded-lg hover:bg-yellow-500 transition"
          >
            View All Tickets
          </button>
        </div>
      </div>
    </>
  );
}
