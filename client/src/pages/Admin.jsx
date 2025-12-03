import { useEffect, useState } from 'react';

// Use environment variable or default to localhost for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function Admin() {
  const [familyData, setFamilyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [familyRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/family`),
        fetch(`${API_URL}/api/stats`)
      ]);

      const familyData = await familyRes.json();
      const statsData = await statsRes.json();

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
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
            <button
              onClick={downloadCSV}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-xl transition-colors"
            >
              Download CSV
            </button>
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
