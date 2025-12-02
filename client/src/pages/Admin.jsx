import { useEffect, useState } from 'react';

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
        fetch('http://localhost:3001/api/family'),
        fetch('http://localhost:3001/api/stats')
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
      <div className="text-center py-20">
        <div className="text-3xl text-amber-800 font-bold" style={{fontFamily: "'Dancing Script', cursive"}}>
          ✨ Loading... ✨
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="festive-card bg-white rounded-2xl shadow-2xl p-8 mb-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-4xl font-bold text-amber-900 celebration-title" style={{fontFamily: "'Dancing Script', cursive"}}>
            📊 Admin Dashboard 📊
          </h2>
          <button
            onClick={downloadCSV}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            Download CSV
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-semibold mb-1">Total Registered</h3>
              <p className="text-3xl font-bold">{stats.totalMembers}</p>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-semibold mb-1">Total Attendees</h3>
              <p className="text-3xl font-bold">{stats.totalAttendees}</p>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-semibold mb-1">Generations</h3>
              <p className="text-3xl font-bold">{Object.keys(stats.byGeneration).length}</p>
            </div>

            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-semibold mb-1">Family Branches</h3>
              <p className="text-3xl font-bold">{Object.keys(stats.byBranch).length}</p>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Filter by Generation:
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
          >
            <option value="all">All Generations</option>
            <option value="1">1st Generation</option>
            <option value="2">2nd Generation</option>
            <option value="3">3rd Generation</option>
            <option value="4">4th Generation</option>
            <option value="5">5th Generation</option>
          </select>
          <span className="ml-4 text-gray-600">
            Showing {filteredData.length} members
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {filteredData.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No registrations yet
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-amber-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-amber-900 uppercase tracking-wider">Photo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-amber-900 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-amber-900 uppercase tracking-wider">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-amber-900 uppercase tracking-wider">Relationship</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-amber-900 uppercase tracking-wider">Generation</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-amber-900 uppercase tracking-wider">Branch</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-amber-900 uppercase tracking-wider">Attendees</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((member) => (
                  <tr key={member.id} className="hover:bg-amber-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      {member.photo ? (
                        <img
                          src={`http://localhost:3001${member.photo}`}
                          alt={member.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-amber-500"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 font-bold">
                          {member.name.charAt(0)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{member.name}</div>
                      <div className="text-xs text-gray-500">via {member.connectedThrough}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{member.email}</div>
                      <div className="text-xs text-gray-500">{member.phone}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {member.relationshipType}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                        Gen {member.generation}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {member.familyBranch}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
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
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h3 className="text-2xl font-bold text-amber-900 mb-4">Generation Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(stats.byGeneration).map(([gen, count]) => (
              <div key={gen} className="bg-amber-50 p-4 rounded-lg text-center">
                <div className="text-sm text-gray-600">Generation {gen}</div>
                <div className="text-2xl font-bold text-amber-900">{count}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
