export default function Home() {
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sample Match Cards */}
          <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-500/20 rounded-lg overflow-hidden hover:border-yellow-500/50 transition-all">
            <div className="h-48 bg-gradient-to-br from-gray-800 to-gray-900"></div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-2">
                Loading matches...
              </h3>
              <p className="text-gray-400 mb-4">Connect to backend soon</p>
              <button className="w-full bg-yellow-500 text-black py-2 rounded-lg font-semibold hover:bg-yellow-400 transition">
                View Details
              </button>
            </div>
          </div>
        </div>
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
