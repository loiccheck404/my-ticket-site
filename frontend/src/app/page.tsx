"use client";

import { useEffect, useState } from "react";

interface Match {
  id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  imageUrl: string;
  category: string;
}

export default function Home() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch matches from backend
  useEffect(() => {
    fetch("http://localhost:5000/api/matches")
      .then((res) => res.json())
      .then((data) => {
        setMatches(data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching matches:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-black via-gray-900 to-black text-white py-24 border-b border-yellow-500/20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            Premium Match Tickets
          </h1>
          <p className="text-xl mb-8 text-gray-300">
            Experience the thrill. Book your seats for the world's biggest
            matches.
          </p>
          <button className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-10 py-4 rounded-lg font-bold hover:from-yellow-400 hover:to-yellow-500 transition-all transform hover:scale-105">
            Explore Matches
          </button>
        </div>
      </div>

      {/* Matches Section */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold mb-12 text-white">
          Upcoming <span className="text-yellow-500">Matches</span>
        </h2>

        {loading ? (
          <p className="text-gray-400">Loading matches...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {matches.map((match) => (
              <div
                key={match.id}
                className="bg-gradient-to-br from-gray-900 to-black border border-yellow-500/20 rounded-lg overflow-hidden hover:border-yellow-500/50 transition-all hover:transform hover:scale-105"
              >
                <div className="h-48 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                  <p className="text-yellow-500 text-2xl font-bold">
                    {match.title}
                  </p>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {match.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-2">{match.venue}</p>
                  <p className="text-gray-500 text-sm mb-4">
                    {new Date(match.date).toLocaleDateString()}
                  </p>
                  <p className="text-gray-400 mb-4">{match.description}</p>
                  <button
                    onClick={() =>
                      (window.location.href = `/matches/${match.id}`)
                    }
                    className="w-full bg-yellow-500 text-black py-2 rounded-lg font-semibold hover:bg-yellow-400 transition"
                  >
                    Book Tickets
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-yellow-500/20 bg-gradient-to-r from-black via-gray-900 to-black py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400">
          <p>© 2025 Premium Tickets. Powered by blockchain technology.</p>
        </div>
      </div>
    </div>
  );
}
