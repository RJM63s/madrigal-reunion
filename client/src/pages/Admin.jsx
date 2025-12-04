import { useEffect, useState } from 'react';

// Use environment variable, or empty string for same-origin requests in production
// In development, VITE_API_URL should be set to http://localhost:3001
const API_URL = import.meta.env.VITE_API_URL || '';

function Admin() {
  const [familyData, setFamilyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    // Check if password is already stored in sessionStorage
    const storedPassword = sessionStorage.getItem('adminPassword');
    if (storedPassword) {
      setPassword(storedPassword);
      verifyPassword(storedPassword);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyPassword = async (pwd) => {
    setIsVerifying(true);
    setPasswordError('');

    try {
      const response = await fetch(`${API_URL}/api/admin/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: pwd })
      });

      const result = await response.json();

      if (result.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem('adminPassword', pwd);
        fetchData(pwd);
      } else {
        setPasswordError('Invalid password');
        sessionStorage.removeItem('adminPassword');
        setIsAuthenticated(false);
        setLoading(false);
      }
    } catch (error) {
      setPasswordError('Error verifying password');
      setLoading(false);
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password.trim()) {
      verifyPassword(password);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminPassword');
    setIsAuthenticated(false);
    setPassword('');
    setFamilyData([]);
    setStats(null);
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDeleteClick = (member) => {
    setDeleteConfirm(member);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    setIsDeleting(true);
    const adminPassword = sessionStorage.getItem('adminPassword');

    try {
      const response = await fetch(`${API_URL}/api/admin/registrations/${deleteConfirm.id}`, {
        method: 'DELETE',
        headers: {
          'X-Admin-Password': adminPassword
        }
      });

      const result = await response.json();

      if (result.success) {
        setFamilyData(prev => prev.filter(m => m.id !== deleteConfirm.id));
        setStats(prev => ({
          ...prev,
          totalMembers: prev.totalMembers - 1,
          totalAttendees: prev.totalAttendees - (deleteConfirm.attendees || 0)
        }));
        showNotification(result.message, 'success');
      } else {
        showNotification(result.message || 'Failed to delete registration', 'error');
      }
    } catch (error) {
      showNotification('Error deleting registration', 'error');
    } finally {
      setIsDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  const fetchData = async (adminPassword) => {
    try {
      const headers = {
        'X-Admin-Password': adminPassword
      };

      const registrationsUrl = `${API_URL}/api/admin/registrations`;
      const statsUrl = `${API_URL}/api/admin/stats`;

      console.log('Fetching registrations from:', registrationsUrl);
      console.log('Fetching stats from:', statsUrl);
      console.log('Using headers:', { 'X-Admin-Password': adminPassword ? '[SET]' : '[NOT SET]' });

      const [familyRes, statsRes] = await Promise.all([
        fetch(registrationsUrl, { headers }),
        fetch(statsUrl, { headers })
      ]);

      console.log('Registrations response status:', familyRes.status);
      console.log('Stats response status:', statsRes.status);

      if (!familyRes.ok || !statsRes.ok) {
        const familyError = !familyRes.ok ? await familyRes.text() : null;
        const statsError = !statsRes.ok ? await statsRes.text() : null;
        console.error('Response errors:', { familyError, statsError });
        throw new Error('Failed to fetch data');
      }

      const familyData = await familyRes.json();
      const statsData = await statsRes.json();

      console.log('Fetched registrations:', familyData.length);
      console.log('Fetched stats:', statsData);

      setFamilyData(familyData);
      setStats(statsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const filteredData = filter === 'all'
    ? familyData
    : familyData.filter(member => member.generation === parseInt(filter));

  const downloadCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Relationship', 'Connected Through', 'Generation', 'Branch', 'Attendees'];
    const csvData = filteredData.map(member => [
      member.name,
      member.email,
      member.phone,
      member.relationshipType,
      member.connectedThrough,
      member.generation,
      member.familyBranch,
      member.attendees
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'madrigal-family-registrations.csv';
    a.click();
  };

  // Show loading spinner while checking sessionStorage or verifying stored password
  if (loading && !isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-50">
        <div className="text-neutral-500">Loading...</div>
      </div>
    );
  }

  // Show password prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
        <div className="modern-card p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-neutral-900 mb-2">Admin Access</h1>
            <p className="text-neutral-600">Enter password to access the admin dashboard</p>
          </div>

          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-6">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin password"
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                disabled={isVerifying}
              />
              {passwordError && (
                <p className="mt-2 text-sm text-red-600">{passwordError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isVerifying || !password.trim()}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-neutral-400 text-white font-medium py-3 rounded-xl transition-colors"
            >
              {isVerifying ? 'Verifying...' : 'Access Dashboard'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Show loading while fetching data after authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-50">
        <div className="text-neutral-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-neutral-900 mb-2">Admin Dashboard</h1>
              <p className="text-neutral-600">Manage registrations and view statistics</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={downloadCSV}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-xl transition-colors"
              >
                Download CSV
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 font-medium rounded-xl transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Total Registered"
              value={stats.totalMembers}
              bgColor="bg-orange-50"
              textColor="text-orange-700"
            />
            <StatCard
              label="Total Attendees"
              value={stats.totalAttendees}
              bgColor="bg-green-50"
              textColor="text-green-700"
            />
            <StatCard
              label="Generations"
              value={Object.keys(stats.byGeneration).length}
              bgColor="bg-blue-50"
              textColor="text-blue-700"
            />
            <StatCard
              label="Family Branches"
              value={Object.keys(stats.byBranch).length}
              bgColor="bg-purple-50"
              textColor="text-purple-700"
            />
          </div>
        )}

        {/* Filter & Table Card */}
        <div className="modern-card p-6 md:p-8 mb-8">
          {/* Filter */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-neutral-700">
                Filter by Generation:
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              >
                <option value="all">All Generations</option>
                <option value="1">1st Generation</option>
                <option value="2">2nd Generation</option>
                <option value="3">3rd Generation</option>
                <option value="4">4th Generation</option>
                <option value="5">5th Generation</option>
              </select>
            </div>
            <span className="text-sm text-neutral-600">
              {filteredData.length} {filteredData.length === 1 ? 'member' : 'members'}
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto -mx-6 md:-mx-8">
            {filteredData.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📋</div>
                <p className="text-neutral-500">No registrations yet</p>
              </div>
            ) : (
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Photo</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider hidden md:table-cell">Contact</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider hidden lg:table-cell">Relationship</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Generation</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider hidden xl:table-cell">Branch</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Attendees</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {filteredData.map((member) => (
                    <tr key={member.id} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {member.photo ? (
                          <img
                            src={`${API_URL}${member.photo}`}
                            alt={member.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-600 font-medium">
                            {member.name.charAt(0)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-neutral-900">{member.name}</div>
                        <div className="text-xs text-neutral-500">via {member.connectedThrough}</div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="text-sm text-neutral-900">{member.email}</div>
                        <div className="text-xs text-neutral-500">{member.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 hidden lg:table-cell">
                        {member.relationshipType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700">
                          Gen {member.generation}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-900 max-w-xs truncate hidden xl:table-cell">
                        {member.familyBranch}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 text-center font-medium">
                        {member.attendees}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteClick(member)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          title="Delete registration"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Generation Breakdown */}
        {stats && Object.keys(stats.byGeneration).length > 0 && (
          <div className="modern-card p-6 md:p-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-6">Generation Breakdown</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Object.entries(stats.byGeneration).map(([gen, count]) => (
                <div key={gen} className="bg-neutral-100 p-6 rounded-xl text-center">
                  <div className="text-sm text-neutral-600 mb-2">Generation {gen}</div>
                  <div className="text-3xl font-semibold text-neutral-900">{count}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="modern-card p-6 md:p-8 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">Delete Registration?</h3>
              <p className="text-neutral-600 mb-6">
                Are you sure you want to delete <span className="font-medium text-neutral-900">{deleteConfirm.name}</span>? This will remove them from both the database and Google Sheets. This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleDeleteCancel}
                  disabled={isDeleting}
                  className="px-6 py-3 bg-neutral-200 hover:bg-neutral-300 disabled:bg-neutral-100 text-neutral-700 font-medium rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-xl transition-colors"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className={`px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 ${
            notification.type === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
          }`}>
            {notification.type === 'success' ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, bgColor, textColor }) {
  return (
    <div className="modern-card p-6">
      <div className={`inline-flex items-center justify-center w-12 h-12 ${bgColor} rounded-xl mb-4`}>
        <span className={`text-2xl font-bold ${textColor}`}>{value}</span>
      </div>
      <h3 className="text-sm font-medium text-neutral-600">{label}</h3>
      <p className="text-2xl font-semibold text-neutral-900 mt-1">{value}</p>
    </div>
  );
}

export default Admin;
