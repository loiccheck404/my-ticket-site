"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Stats {
  totalSales: number;
  totalOrders: number;
  totalUsers: number;
  totalTickets: number;
  ordersByStatus: { status: string; _count: { status: number } }[];
  recentOrders: any[];
}

interface Order {
  orderId: string;
  userName: string;
  userEmail: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  tickets: any[];
  transaction: any;
}

interface User {
  id: string;
  name: string;
  email: string;
  orderCount: number;
  joinedAt: string;
}

interface Match {
  id: string;
  title: string;
  date: string;
  venue: string;
  totalSeats: number;
  bookedSeats: number;
  availableSeats: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch stats
      const statsRes = await fetch("http://localhost:5000/api/admin/stats");
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats);
      }

      // Fetch orders
      const ordersRes = await fetch("http://localhost:5000/api/admin/orders");
      const ordersData = await ordersRes.json();
      if (ordersData.success) {
        setOrders(ordersData.orders);
      }

      // Fetch users
      const usersRes = await fetch("http://localhost:5000/api/admin/users");
      const usersData = await usersRes.json();
      if (usersData.success) {
        setUsers(usersData.users);
      }

      // Fetch matches
      const matchesRes = await fetch("http://localhost:5000/api/admin/matches");
      const matchesData = await matchesRes.json();
      if (matchesData.success) {
        setMatches(matchesData.matches);
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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

  const filteredOrders = orders.filter(
    (order) =>
      order.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMatches = matches.filter((match) =>
    match.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-[#FFD700]">
              Admin Dashboard
            </h1>
            <p className="text-gray-400 mt-2">
              Manage your ticket booking platform
            </p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
          >
            ← Back to Home
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Statistics Cards */}
        {activeTab === "overview" && stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-900 to-green-700 p-6 rounded-lg border border-[#FFD700]">
              <p className="text-gray-200 text-sm">Total Sales</p>
              <p className="text-4xl font-bold text-white mt-2">
                ${stats.totalSales.toFixed(2)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-900 to-blue-700 p-6 rounded-lg border border-[#FFD700]">
              <p className="text-gray-200 text-sm">Total Orders</p>
              <p className="text-4xl font-bold text-white mt-2">
                {stats.totalOrders}
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-900 to-purple-700 p-6 rounded-lg border border-[#FFD700]">
              <p className="text-gray-200 text-sm">Total Users</p>
              <p className="text-4xl font-bold text-white mt-2">
                {stats.totalUsers}
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-900 to-yellow-700 p-6 rounded-lg border border-[#FFD700]">
              <p className="text-gray-200 text-sm">Tickets Sold</p>
              <p className="text-4xl font-bold text-white mt-2">
                {stats.totalTickets}
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-700 mb-8">
          <button
            onClick={() => {
              setActiveTab("overview");
              setSearchTerm("");
            }}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === "overview"
                ? "text-[#FFD700] border-b-2 border-[#FFD700]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => {
              setActiveTab("orders");
              setSearchTerm("");
            }}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === "orders"
                ? "text-[#FFD700] border-b-2 border-[#FFD700]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Orders ({orders.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("users");
              setSearchTerm("");
            }}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === "users"
                ? "text-[#FFD700] border-b-2 border-[#FFD700]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("matches");
              setSearchTerm("");
            }}
            className={`px-6 py-3 font-semibold transition ${
              activeTab === "matches"
                ? "text-[#FFD700] border-b-2 border-[#FFD700]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Matches ({matches.length})
          </button>
        </div>

        {/* Search Bar (for orders, users, matches) */}
        {activeTab !== "overview" && (
          <div className="mb-6">
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-[#FFD700] focus:outline-none"
            />
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === "overview" && stats && (
          <div>
            <h2 className="text-2xl font-bold text-[#FFD700] mb-4">
              Recent Orders
            </h2>
            <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-[#FFD700]">
                      Order ID
                    </th>
                    <th className="px-4 py-3 text-left text-[#FFD700]">User</th>
                    <th className="px-4 py-3 text-left text-[#FFD700]">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-[#FFD700]">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-[#FFD700]">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((order) => (
                    <tr key={order.id} className="border-t border-gray-700">
                      <td className="px-4 py-3 text-sm font-mono">
                        {order.id.slice(0, 8)}...
                      </td>
                      <td className="px-4 py-3">{order.userName}</td>
                      <td className="px-4 py-3 text-[#FFD700] font-bold">
                        ${order.amount}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`${getStatusColor(
                            order.status
                          )} text-white px-2 py-1 rounded text-xs font-bold`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-sm">
                        {formatDate(order.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && (
          <div>
            <h2 className="text-2xl font-bold text-[#FFD700] mb-4">
              All Orders ({filteredOrders.length})
            </h2>
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.orderId}
                  className="bg-gray-900 rounded-lg border border-gray-700 p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-[#FFD700] font-bold">
                        Order #{order.orderId.slice(0, 8)}...
                      </p>
                      <p className="text-white mt-1">{order.userName}</p>
                      <p className="text-gray-400 text-sm">{order.userEmail}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">
                        ${order.totalAmount}
                      </p>
                      <span
                        className={`${getStatusColor(
                          order.status
                        )} text-white px-3 py-1 rounded text-xs font-bold mt-2 inline-block`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="border-t border-gray-700 pt-4">
                    <p className="text-gray-400 text-sm mb-2">Tickets:</p>
                    {order.tickets.map((ticket, idx) => (
                      <p key={idx} className="text-white text-sm">
                        • {ticket.match} - {ticket.ticketType} - Seat{" "}
                        {ticket.seat} - ${ticket.price}
                      </p>
                    ))}
                  </div>
                  <p className="text-gray-400 text-sm mt-4">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div>
            <h2 className="text-2xl font-bold text-[#FFD700] mb-4">
              All Users ({filteredUsers.length})
            </h2>
            <div className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-[#FFD700]">Name</th>
                    <th className="px-4 py-3 text-left text-[#FFD700]">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-[#FFD700]">
                      Orders
                    </th>
                    <th className="px-4 py-3 text-left text-[#FFD700]">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-t border-gray-700">
                      <td className="px-4 py-3">{user.name}</td>
                      <td className="px-4 py-3 text-gray-400">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className="bg-[#FFD700] text-black px-3 py-1 rounded font-bold">
                          {user.orderCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-sm">
                        {formatDate(user.joinedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Matches Tab */}
        {activeTab === "matches" && (
          <div>
            <h2 className="text-2xl font-bold text-[#FFD700] mb-4">
              All Matches ({filteredMatches.length})
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {filteredMatches.map((match) => (
                <div
                  key={match.id}
                  className="bg-gray-900 rounded-lg border border-gray-700 p-6"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-[#FFD700]">
                        {match.title}
                      </h3>
                      <p className="text-gray-400 mt-1">📍 {match.venue}</p>
                      <p className="text-gray-400">
                        📅 {formatDate(match.date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white">
                        <span className="text-green-500 font-bold">
                          {match.bookedSeats}
                        </span>{" "}
                        /{" "}
                        <span className="text-gray-400">
                          {match.totalSeats}
                        </span>
                      </p>
                      <p className="text-sm text-gray-400">Seats Booked</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
