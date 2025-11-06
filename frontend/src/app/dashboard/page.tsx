"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Seat {
  seatNumber: string;
  row: string;
  section: string;
}

interface Match {
  id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  imageUrl: string;
}

interface Ticket {
  ticketType: string;
  price: number;
  quantity: number;
  match: Match;
  seat: Seat | null;
}

interface Transaction {
  cryptocurrency: string;
  cryptoAmount: number;
  walletAddress: string;
  status: string;
  confirmations: number;
}

interface Order {
  orderId: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  paymentMethod: string;
  user: {
    name: string;
    email: string;
  };
  tickets: Ticket[];
  transaction: Transaction | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tickets"); // tickets, orders, profile
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
      return;
    }

    const userData = JSON.parse(storedUser);
    setUser(userData);

    // Fetch user orders
    fetchOrders(userData.id);
  }, [router]);

  const fetchOrders = async (userId: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/orders/user/${userId}`
      );
      const data = await response.json();

      if (data.success) {
        setOrders(data.orders);
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
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "CONFIRMED":
      case "COMPLETED":
        return "bg-green-500";
      case "PENDING":
        return "bg-yellow-500";
      case "FAILED":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#FFD700] text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-black via-gray-900 to-black border-b border-[#FFD700] py-6">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-[#FFD700]">My Dashboard</h1>
          {user && (
            <p className="text-gray-400 mt-2">
              Welcome back, {user.firstName} {user.lastName}
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 mt-8">
        <div className="flex gap-4 border-b border-gray-700">
          <button
            onClick={() => setActiveTab("tickets")}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === "tickets"
                ? "text-[#FFD700] border-b-2 border-[#FFD700]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            My Tickets
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === "orders"
                ? "text-[#FFD700] border-b-2 border-[#FFD700]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Order History
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === "profile"
                ? "text-[#FFD700] border-b-2 border-[#FFD700]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Profile
          </button>
        </div>

        {/* Content */}
        <div className="mt-8">
          {activeTab === "tickets" && (
            <div>
              <h2 className="text-2xl font-bold text-[#FFD700] mb-6">
                My Tickets ({orders.length})
              </h2>

              {orders.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-400 text-xl">No tickets yet</p>
                  <button
                    onClick={() => router.push("/")}
                    className="mt-4 px-6 py-3 bg-[#FFD700] text-black font-bold rounded hover:bg-yellow-500 transition"
                  >
                    Browse Matches
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {orders.map((order) =>
                    order.tickets.map((ticket, idx) => (
                      <div
                        key={`${order.orderId}-${idx}`}
                        className="bg-gradient-to-r from-gray-900 to-black border border-[#FFD700] rounded-lg p-6 hover:shadow-lg hover:shadow-[#FFD700]/20 transition"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex gap-6">
                            {/* Match Image */}
                            <img
                              src={ticket.match.imageUrl}
                              alt={ticket.match.title}
                              className="w-32 h-32 object-cover rounded"
                            />

                            {/* Match Info */}
                            <div>
                              <h3 className="text-2xl font-bold text-[#FFD700]">
                                {ticket.match.title}
                              </h3>
                              <p className="text-gray-400 mt-1">
                                {ticket.match.description}
                              </p>
                              <div className="mt-4 space-y-2">
                                <p className="text-white">
                                  📅 {formatDate(ticket.match.date)}
                                </p>
                                <p className="text-white">
                                  📍 {ticket.match.venue}
                                </p>
                                {ticket.seat && (
                                  <p className="text-white">
                                    🎫 {ticket.seat.section} Section - Row{" "}
                                    {ticket.seat.row} - Seat{" "}
                                    {ticket.seat.seatNumber}
                                  </p>
                                )}
                                <p className="text-[#FFD700] font-bold">
                                  {ticket.ticketType} - ${ticket.price}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="text-right">
                            <span
                              className={`${getStatusColor(
                                order.status
                              )} text-white px-4 py-2 rounded font-bold`}
                            >
                              {order.status}
                            </span>
                            {order.transaction && (
                              <div className="mt-4 text-sm text-gray-400">
                                <p>
                                  Paid with {order.transaction.cryptocurrency}
                                </p>
                                <p>
                                  {order.transaction.confirmations}{" "}
                                  confirmations
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "orders" && (
            <div>
              <h2 className="text-2xl font-bold text-[#FFD700] mb-6">
                Order History
              </h2>
              <p className="text-gray-400">Coming soon...</p>
            </div>
          )}

          {activeTab === "profile" && (
            <div>
              <h2 className="text-2xl font-bold text-[#FFD700] mb-6">
                Profile
              </h2>
              <p className="text-gray-400">Coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
