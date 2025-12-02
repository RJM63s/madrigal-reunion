import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Link } from 'react-router-dom';

function Home() {
  const canvasRef = useRef(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Generate QR code
    const registrationUrl = window.location.origin + '/register';
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, registrationUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#78350f',
          light: '#fffbeb'
        }
      });
    }

    // Fetch stats
    fetch('http://localhost:3001/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('Error fetching stats:', err));
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="festive-card bg-white rounded-2xl shadow-2xl p-10 mb-8">
        <h2 className="text-5xl font-bold text-amber-900 mb-4 text-center celebration-title" style={{fontFamily: "'Dancing Script', cursive"}}>
          🌺 Welcome to the Madrigal Family Reunion! 🌺
        </h2>
        <p className="text-xl text-gray-700 text-center mb-8 font-light">
          Join us for a celebration of family, heritage, and togetherness.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="text-center">
            <h3 className="text-2xl font-semibold text-amber-800 mb-4">
              Scan to Register
            </h3>
            <div className="flex justify-center mb-4">
              <canvas ref={canvasRef} className="border-4 border-amber-600 rounded-lg"></canvas>
            </div>
            <p className="text-gray-600">
              Scan this QR code with your phone to register for the reunion
            </p>
          </div>

          <div>
            <h3 className="text-2xl font-semibold text-amber-800 mb-4">
              Event Details
            </h3>
            <div className="space-y-3 text-gray-700">
              <p><strong>Date:</strong> To Be Announced</p>
              <p><strong>Location:</strong> Encanto Village</p>
              <p><strong>Time:</strong> All Day Celebration</p>
            </div>

            {stats && (
              <div className="mt-6 p-4 bg-amber-50 rounded-lg">
                <h4 className="font-semibold text-amber-900 mb-2">Registration Stats</h4>
                <p className="text-sm">Registered Members: {stats.totalMembers}</p>
                <p className="text-sm">Total Attendees: {stats.totalAttendees}</p>
              </div>
            )}

            <div className="mt-6">
              <Link
                to="/register"
                className="block w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-6 rounded-lg text-center transition"
              >
                Register Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Link
          to="/family-tree"
          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white p-6 rounded-lg shadow-lg text-center transition transform hover:scale-105"
        >
          <h3 className="text-2xl font-bold mb-2">View Family Tree</h3>
          <p>Explore our family connections</p>
        </Link>

        <Link
          to="/admin"
          className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white p-6 rounded-lg shadow-lg text-center transition transform hover:scale-105"
        >
          <h3 className="text-2xl font-bold mb-2">Admin Dashboard</h3>
          <p>View all registrations</p>
        </Link>
      </div>
    </div>
  );
}

export default Home;
