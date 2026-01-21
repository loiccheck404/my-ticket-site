"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Match {
  id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
}

interface Ticket {
  id: string;
  type: string;
  price: number;
  availableCount: number;
  category: number;
  color: string;
}

interface Seat {
  isBooked: any;
  id: string;
  seatNumber: string;
  row: string;
  section: string;
  ticket: {
    price: number;
    category: number;
    color: string;
  };
}

export default function MatchDetails() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.id as string;

  const [match, setMatch] = useState<Match | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [allSeats, setAllSeats] = useState<Seat[]>([]); // All seats from all categories
  const [selectedSeatsData, setSelectedSeatsData] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch match details
  useEffect(() => {
    fetch(`http://localhost:5000/api/matches/${matchId}`)
      .then((res) => res.json())
      .then((data) => {
        setMatch(data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching match:", error);
        setLoading(false);
      });
  }, [matchId]);

  // Fetch ticket types
  useEffect(() => {
    fetch(`http://localhost:5000/api/matches/${matchId}/tickets`)
      .then((res) => res.json())
      .then((data) => {
        setTickets(
          data.data.sort((a: Ticket, b: Ticket) => a.category - b.category),
        );
      })
      .catch((error) => console.error("Error fetching tickets:", error));
  }, [matchId]);

  // Fetch ALL seats from ALL categories at once
  useEffect(() => {
    if (tickets.length > 0) {
      // Fetch seats for all ticket types
      const fetchPromises = tickets.map((ticket) =>
        fetch(
          `http://localhost:5000/api/matches/${matchId}/seats?ticketType=${ticket.type}`,
        )
          .then((res) => res.json())
          .then((data) => data.data),
      );

      Promise.all(fetchPromises)
        .then((results) => {
          // Combine all seats from all categories
          const combinedSeats = results.flat();
          setAllSeats(combinedSeats);
        })
        .catch((error) => console.error("Error fetching seats:", error));
    }
  }, [matchId, tickets]);

  const toggleSeat = (seat: Seat) => {
    if (seat.isBooked) return;

    const isSelected = selectedSeatsData.some((s) => s.id === seat.id);
    if (isSelected) {
      setSelectedSeatsData(selectedSeatsData.filter((s) => s.id !== seat.id));
    } else {
      setSelectedSeatsData([...selectedSeatsData, seat]);
    }
  };

  const isSeatSelected = (seatId: string) => {
    return selectedSeatsData.some((s) => s.id === seatId);
  };

  const totalPrice = selectedSeatsData.reduce((total, seat) => {
    return total + seat.ticket.price;
  }, 0);

  // Get category color classes
  const getCategoryColor = (category: number) => {
    const colors: Record<number, string> = {
      1: "bg-purple-500 hover:bg-purple-600 border-purple-400",
      2: "bg-blue-500 hover:bg-blue-600 border-blue-400",
      3: "bg-teal-500 hover:bg-teal-600 border-teal-400",
      4: "bg-yellow-500 hover:bg-yellow-600 border-yellow-400",
    };
    return colors[category] || "bg-gray-500";
  };

  // Group ALL seats by category AND section
  const seatsByCategory = allSeats.reduce(
    (acc, seat) => {
      const category = seat.ticket.category;
      if (!acc[category]) acc[category] = {};
      if (!acc[category][seat.section]) acc[category][seat.section] = [];
      acc[category][seat.section].push(seat);
      return acc;
    },
    {} as Record<number, Record<string, Seat[]>>,
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A0A0A] via-[#1A237E]/20 to-[#0A0A0A] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-[#FF6B35]"></div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0A0A0A] via-[#1A237E]/20 to-[#0A0A0A] flex items-center justify-center">
        <p className="text-red-500 text-xl">Match not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0A] via-[#1A237E]/20 to-[#0A0A0A]">
      {/* Header */}
      <div className="bg-black/80 backdrop-blur-xl border-b border-[#FF6B35]/20 py-6">
        <div className="max-w-7xl mx-auto px-6">
          <button
            onClick={() => router.push("/")}
            className="text-[#FF6B35] hover:text-[#FFD700] mb-4 flex items-center gap-2 transition"
          >
            ← Back to Matches
          </button>
          <h1 className="text-4xl font-bebas tracking-wider bg-gradient-to-r from-[#FF6B35] via-[#FFD700] to-[#00BCD4] bg-clip-text text-transparent mb-2">
            {match.title}
          </h1>
          <p className="text-gray-400">{match.venue}</p>
          <p className="text-gray-500">
            {new Date(match.date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Category Legend */}
        <div className="mb-8">
          <h2 className="text-3xl font-bebas text-white mb-6 tracking-wider">
            🎫 TICKET CATEGORIES
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="p-6 rounded-xl font-semibold bg-white/5 border-2 border-white/10"
              >
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-4 h-4 rounded-full ${getCategoryColor(ticket.category)}`}
                    ></div>
                    <p className="text-xl font-bebas tracking-wider text-white">
                      {ticket.type}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    ${ticket.price.toLocaleString()}
                  </p>
                  <p className="text-sm opacity-80 mt-2 text-white/60">
                    {ticket.availableCount} seats available
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Full Stadium View with Concentric Rings */}
        <div className="mb-8">
          <h2 className="text-3xl font-bebas text-white mb-6 tracking-wider">
            🏟️ STADIUM SEATING MAP
          </h2>

          {/* Legend */}
          <div className="flex gap-6 mb-6 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-white/10 border-2 border-white/30"></div>
              <span className="text-white text-sm">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-green-500 border-2 border-green-400"></div>
              <span className="text-white text-sm">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gray-600"></div>
              <span className="text-white text-sm">Unavailable</span>
            </div>
          </div>

          {/* Concentric Rings Stadium */}
          <div className="relative bg-gradient-to-br from-black/80 to-gray-900/80 rounded-3xl p-4 md:p-8 border-2 border-white/10 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, white 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              ></div>
            </div>

            {/* Stadium Container */}
            <div
              className="relative w-full max-w-6xl mx-auto"
              style={{ aspectRatio: "1.2/1" }}
            >
              {/* Football Field - Center */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[35%] h-[45%] bg-gradient-to-br from-green-600 via-green-500 to-green-600 rounded-2xl shadow-2xl border-4 border-white/20 z-10">
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-white text-sm md:text-xl font-bebas tracking-widest">
                    ⚽ FIELD ⚽
                  </p>
                </div>
                {/* Center Circle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 md:w-20 md:h-20 border-2 border-white/30 rounded-full"></div>
              </div>

              {/* Category 1 - Innermost Ring (Closest to field) */}
              {seatsByCategory[1] && (
                <div className="absolute inset-0">
                  {Object.entries(seatsByCategory[1])
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([section, sectionSeats], index, array) => {
                      const totalSections = array.length;
                      const angle =
                        (index / totalSections) * 2 * Math.PI - Math.PI / 2;
                      const radiusX = 28;
                      const radiusY = 30;
                      const x = 50 + radiusX * Math.cos(angle);
                      const y = 50 + radiusY * Math.sin(angle);

                      return (
                        <div
                          key={`cat1-${section}`}
                          className="absolute -translate-x-1/2 -translate-y-1/2"
                          style={{ left: `${x}%`, top: `${y}%` }}
                        >
                          <div className="text-center mb-1">
                            <span className="text-purple-400 font-bold text-[10px] md:text-xs px-2 py-1 bg-purple-900/60 rounded-full border border-purple-500/30">
                              {section}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            {sectionSeats
                              .sort((a, b) =>
                                a.seatNumber.localeCompare(b.seatNumber),
                              )
                              .slice(0, 6)
                              .map((seat) => (
                                <button
                                  key={seat.id}
                                  onClick={() => toggleSeat(seat)}
                                  disabled={seat.isBooked}
                                  className={`w-6 h-6 md:w-8 md:h-8 rounded text-[8px] md:text-[10px] font-bold transition-all duration-200 border ${
                                    seat.isBooked
                                      ? "bg-gray-600 border-gray-700 cursor-not-allowed opacity-50"
                                      : isSeatSelected(seat.id)
                                        ? "bg-green-500 border-green-400 scale-110 shadow-lg"
                                        : "bg-purple-500/30 border-purple-400/50 text-white hover:bg-purple-500/50 hover:scale-105"
                                  }`}
                                  title={`${seat.seatNumber} - $${seat.ticket.price}`}
                                >
                                  {seat.seatNumber.slice(-2)}
                                </button>
                              ))}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Category 2 - Second Ring */}
              {seatsByCategory[2] && (
                <div className="absolute inset-0">
                  {Object.entries(seatsByCategory[2])
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([section, sectionSeats], index, array) => {
                      const totalSections = array.length;
                      const angle =
                        (index / totalSections) * 2 * Math.PI - Math.PI / 2;
                      const radiusX = 35;
                      const radiusY = 37;
                      const x = 50 + radiusX * Math.cos(angle);
                      const y = 50 + radiusY * Math.sin(angle);

                      return (
                        <div
                          key={`cat2-${section}`}
                          className="absolute -translate-x-1/2 -translate-y-1/2"
                          style={{ left: `${x}%`, top: `${y}%` }}
                        >
                          <div className="text-center mb-1">
                            <span className="text-blue-400 font-bold text-[10px] md:text-xs px-2 py-1 bg-blue-900/60 rounded-full border border-blue-500/30">
                              {section}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            {sectionSeats
                              .sort((a, b) =>
                                a.seatNumber.localeCompare(b.seatNumber),
                              )
                              .slice(0, 6)
                              .map((seat) => (
                                <button
                                  key={seat.id}
                                  onClick={() => toggleSeat(seat)}
                                  disabled={seat.isBooked}
                                  className={`w-6 h-6 md:w-8 md:h-8 rounded text-[8px] md:text-[10px] font-bold transition-all duration-200 border ${
                                    seat.isBooked
                                      ? "bg-gray-600 border-gray-700 cursor-not-allowed opacity-50"
                                      : isSeatSelected(seat.id)
                                        ? "bg-green-500 border-green-400 scale-110 shadow-lg"
                                        : "bg-blue-500/30 border-blue-400/50 text-white hover:bg-blue-500/50 hover:scale-105"
                                  }`}
                                  title={`${seat.seatNumber} - $${seat.ticket.price}`}
                                >
                                  {seat.seatNumber.slice(-2)}
                                </button>
                              ))}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Category 3 - Third Ring */}
              {seatsByCategory[3] && (
                <div className="absolute inset-0">
                  {Object.entries(seatsByCategory[3])
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([section, sectionSeats], index, array) => {
                      const totalSections = array.length;
                      const angle =
                        (index / totalSections) * 2 * Math.PI - Math.PI / 2;
                      const radiusX = 42;
                      const radiusY = 44;
                      const x = 50 + radiusX * Math.cos(angle);
                      const y = 50 + radiusY * Math.sin(angle);

                      return (
                        <div
                          key={`cat3-${section}`}
                          className="absolute -translate-x-1/2 -translate-y-1/2"
                          style={{ left: `${x}%`, top: `${y}%` }}
                        >
                          <div className="text-center mb-1">
                            <span className="text-teal-400 font-bold text-[10px] md:text-xs px-2 py-1 bg-teal-900/60 rounded-full border border-teal-500/30">
                              {section}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            {sectionSeats
                              .sort((a, b) =>
                                a.seatNumber.localeCompare(b.seatNumber),
                              )
                              .slice(0, 6)
                              .map((seat) => (
                                <button
                                  key={seat.id}
                                  onClick={() => toggleSeat(seat)}
                                  disabled={seat.isBooked}
                                  className={`w-6 h-6 md:w-8 md:h-8 rounded text-[8px] md:text-[10px] font-bold transition-all duration-200 border ${
                                    seat.isBooked
                                      ? "bg-gray-600 border-gray-700 cursor-not-allowed opacity-50"
                                      : isSeatSelected(seat.id)
                                        ? "bg-green-500 border-green-400 scale-110 shadow-lg"
                                        : "bg-teal-500/30 border-teal-400/50 text-white hover:bg-teal-500/50 hover:scale-105"
                                  }`}
                                  title={`${seat.seatNumber} - $${seat.ticket.price}`}
                                >
                                  {seat.seatNumber.slice(-2)}
                                </button>
                              ))}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Category 4 - Outermost Ring (Furthest from field) */}
              {seatsByCategory[4] && (
                <div className="absolute inset-0">
                  {Object.entries(seatsByCategory[4])
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([section, sectionSeats], index, array) => {
                      const totalSections = array.length;
                      const angle =
                        (index / totalSections) * 2 * Math.PI - Math.PI / 2;
                      const radiusX = 49;
                      const radiusY = 48;
                      const x = 50 + radiusX * Math.cos(angle);
                      const y = 50 + radiusY * Math.sin(angle);

                      return (
                        <div
                          key={`cat4-${section}`}
                          className="absolute -translate-x-1/2 -translate-y-1/2"
                          style={{ left: `${x}%`, top: `${y}%` }}
                        >
                          <div className="text-center mb-1">
                            <span className="text-yellow-400 font-bold text-[10px] md:text-xs px-2 py-1 bg-yellow-900/60 rounded-full border border-yellow-500/30">
                              {section}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            {sectionSeats
                              .sort((a, b) =>
                                a.seatNumber.localeCompare(b.seatNumber),
                              )
                              .slice(0, 6)
                              .map((seat) => (
                                <button
                                  key={seat.id}
                                  onClick={() => toggleSeat(seat)}
                                  disabled={seat.isBooked}
                                  className={`w-6 h-6 md:w-8 md:h-8 rounded text-[8px] md:text-[10px] font-bold transition-all duration-200 border ${
                                    seat.isBooked
                                      ? "bg-gray-600 border-gray-700 cursor-not-allowed opacity-50"
                                      : isSeatSelected(seat.id)
                                        ? "bg-green-500 border-green-400 scale-110 shadow-lg"
                                        : "bg-yellow-500/30 border-yellow-400/50 text-white hover:bg-yellow-500/50 hover:scale-105"
                                  }`}
                                  title={`${seat.seatNumber} - $${seat.ticket.price}`}
                                >
                                  {seat.seatNumber.slice(-2)}
                                </button>
                              ))}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Total Availability Counter */}
            <div className="mt-8 text-center relative z-10">
              <p className="text-white text-base md:text-lg">
                <span className="font-bold text-[#FFD700] text-xl md:text-2xl">
                  {allSeats.filter((s) => !s.isBooked).length}
                </span>{" "}
                <span className="text-white/80">total seats available</span>
              </p>
            </div>
          </div>
        </div>

        {/* Selected Seats Summary */}
        {selectedSeatsData.length > 0 && (
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl p-8 rounded-2xl border-2 border-[#FF6B35]/30 shadow-2xl">
            <h3 className="text-2xl font-bebas text-white mb-6 tracking-wider">
              🎟️ SELECTED SEATS ({selectedSeatsData.length})
            </h3>

            <div className="max-h-48 overflow-y-auto space-y-3 mb-6">
              {selectedSeatsData.map((seat) => (
                <div
                  key={seat.id}
                  className="flex justify-between items-center text-white bg-white/5 p-3 rounded-lg"
                >
                  <span className="font-semibold">
                    Category {seat.ticket.category} - {seat.section} - Seat{" "}
                    {seat.seatNumber}
                  </span>
                  <span className="text-[#FFD700] font-bold">
                    ${seat.ticket.price.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t-2 border-white/20 pt-6 mb-6">
              <div className="flex justify-between items-center text-white text-2xl font-bold">
                <span className="font-bebas tracking-wider">TOTAL</span>
                <span className="text-[#FFD700]">
                  ${totalPrice.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                const seatsData = selectedSeatsData.map((seat) => ({
                  id: seat.id,
                  seatNumber: seat.seatNumber,
                  section: seat.section,
                  price: seat.ticket.price,
                }));

                router.push(
                  `/checkout?seats=${encodeURIComponent(
                    JSON.stringify(seatsData),
                  )}&match=${encodeURIComponent(match.title)}`,
                );
              }}
              className="w-full bg-gradient-to-r from-[#FF6B35] to-[#FFD700] text-black py-4 rounded-xl font-bebas text-xl tracking-wider hover:scale-105 transition-all duration-300 shadow-2xl"
            >
              PROCEED TO CHECKOUT →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
