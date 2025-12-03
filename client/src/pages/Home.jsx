import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Link } from 'react-router-dom';
import Countdown from '../components/Countdown';
import { SkeletonStats } from '../components/Skeleton';

// Set your reunion date here
const REUNION_DATE = '2025-12-13T10:00:00';

function Home() {
  const canvasRef = useRef(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Generate QR code
    const registrationUrl = window.location.origin + '/register';
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, registrationUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#292524',
          light: '#ffffff'
        }
      });
    }

    // Fetch stats
    fetch('http://localhost:3001/api/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching stats:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
          <div className="text-center">
            <h1 className="logo-font text-5xl md:text-6xl text-orange-600 mb-4">
              Madrigal
            </h1>
            <p className="text-xl md:text-2xl text-neutral-600 mb-8">
              Family Reunion 2025
            </p>

            {/* Countdown Timer */}
            <div className="modern-card inline-block px-8 py-6 mb-8">
              <Countdown
                targetDate={REUNION_DATE}
                label="Reunion starts in"
              />
            </div>

            <p className="text-neutral-600 max-w-2xl mx-auto">
              Join us for a celebration of family, heritage, and togetherness.
              Register below to be part of our interactive family tree.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* QR Code Card */}
          <div className="modern-card p-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-6">
              Quick Registration
            </h2>
            <div className="flex flex-col items-center">
              <div className="bg-neutral-100 p-4 rounded-2xl mb-4">
                <canvas ref={canvasRef} className="block"></canvas>
              </div>
              <p className="text-sm text-neutral-600 text-center">
                Scan with your phone camera to register quickly
              </p>
            </div>
          </div>

          {/* Stats Card */}
          <div className="modern-card p-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-6">
              Registration Stats
            </h2>
            {loading ? (
              <SkeletonStats />
            ) : stats ? (
              <div className="space-y-4">
                <StatItem
                  label="Registered Members"
                  value={stats.totalMembers}
                  icon={
                    <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                />
                <StatItem
                  label="Total Attendees"
                  value={stats.totalAttendees}
                  icon={
                    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  }
                />
                <StatItem
                  label="Generations"
                  value={Object.keys(stats.byGeneration).length}
                  icon={
                    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  }
                />
              </div>
            ) : (
              <div className="text-neutral-500">Unable to load stats</div>
            )}
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <Link
            to="/register"
            className="modern-card p-8 group card-interactive"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <svg className="w-5 h-5 text-neutral-400 group-hover:text-neutral-600 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              Register Now
            </h3>
            <p className="text-neutral-600">
              Add your information and photo to the family tree
            </p>
          </Link>

          <Link
            to="/family-tree"
            className="modern-card p-8 group card-interactive"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <svg className="w-5 h-5 text-neutral-400 group-hover:text-neutral-600 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              View Family Tree
            </h3>
            <p className="text-neutral-600">
              Explore connections and discover family members
            </p>
          </Link>

          <Link
            to="/gallery"
            className="modern-card p-8 group card-interactive"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <svg className="w-5 h-5 text-neutral-400 group-hover:text-neutral-600 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              Photo Gallery
            </h3>
            <p className="text-neutral-600">
              Share and view family memories together
            </p>
          </Link>

          <div className="modern-card p-8 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-amber-200 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              Save the Date
            </h3>
            <p className="text-neutral-600">
              December 13, 2025 - Mark your calendars for this special gathering!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatItem({ label, value, icon }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-neutral-200 last:border-0">
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-neutral-600">{label}</span>
      </div>
      <span className="text-2xl font-semibold text-neutral-900">{value}</span>
    </div>
  );
}

export default Home;
