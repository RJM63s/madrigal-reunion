import { useEffect, useState, useMemo, useCallback } from 'react';
import BottomSheet from '../components/BottomSheet';
import SearchBar from '../components/SearchBar';
import { SkeletonFamilyTree } from '../components/Skeleton';

// Use environment variable, or empty string for same-origin requests in production
const API_URL = import.meta.env.VITE_API_URL || '';

function FamilyTree() {
  const [familyData, setFamilyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/family`)
      .then(res => res.json())
      .then(data => {
        const sorted = data.sort((a, b) => a.generation - b.generation);
        setFamilyData(sorted);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching family data:', err);
        setLoading(false);
      });
  }, []);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return familyData;

    const query = searchQuery.toLowerCase();
    return familyData.filter(member =>
      member.name.toLowerCase().includes(query) ||
      member.relationshipType?.toLowerCase().includes(query) ||
      member.connectedThrough?.toLowerCase().includes(query) ||
      member.familyBranch?.toLowerCase().includes(query)
    );
  }, [familyData, searchQuery]);

  const handleNodeClick = (member) => {
    setSelectedMember(member);
    setIsSheetOpen(true);
  };

  const closeSheet = () => {
    setIsSheetOpen(false);
    setTimeout(() => setSelectedMember(null), 300);
  };

  // Group by generation
  const generations = filteredData.reduce((acc, member) => {
    if (!acc[member.generation]) {
      acc[member.generation] = [];
    }
    acc[member.generation].push(member);
    return acc;
  }, {});

  if (loading) {
    return <SkeletonFamilyTree />;
  }

  if (familyData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-6 text-center">
        <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
          No family members yet
        </h2>
        <p className="text-neutral-600 mb-6">
          Be the first to register and start the family tree
        </p>
        <a
          href="/register"
          className="bg-orange-600 hover:bg-orange-700 text-white font-medium px-6 py-3 rounded-xl transition-all btn-press"
        >
          Register Now
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white md:bg-neutral-50">
      {/* Header with Search */}
      <div className="bg-white border-b border-neutral-200 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-semibold text-neutral-900 mb-2">Family Tree</h1>
          <p className="text-neutral-600 mb-4">{familyData.length} family members</p>

          {/* Search Bar */}
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search by name, relationship, or branch..."
          />

          {/* Search Results Indicator */}
          {searchQuery && (
            <p className="mt-3 text-sm text-neutral-500">
              {filteredData.length === 0
                ? 'No members found'
                : `Showing ${filteredData.length} result${filteredData.length === 1 ? '' : 's'}`
              }
            </p>
          )}
        </div>
      </div>

      {/* No Results */}
      {searchQuery && filteredData.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">No results found</h3>
          <p className="text-neutral-600">Try searching with different keywords</p>
        </div>
      )}

      {/* Horizontal Timeline - Mobile first */}
      {filteredData.length > 0 && (
        <>
          <div className="md:hidden">
            <div className="horizontal-scroll p-6">
              <div className="inline-flex gap-8 min-w-full stagger-animation">
                {Object.entries(generations).map(([gen, members]) => (
                  <div key={gen} className="flex-shrink-0 fade-in" style={{ width: '280px' }}>
                    {/* Generation Label */}
                    <div className="mb-6 sticky left-0">
                      <span className="inline-block bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full">
                        Generation {gen}
                      </span>
                    </div>

                    {/* Members in this generation */}
                    <div className="space-y-4">
                      {members.map((member, index) => (
                        <MemberCard
                          key={member.id}
                          member={member}
                          onClick={() => handleNodeClick(member)}
                          style={{ animationDelay: `${index * 50}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Vertical Grid - Desktop */}
          <div className="hidden md:block px-6 py-8">
            <div className="max-w-7xl mx-auto">
              {Object.entries(generations).map(([gen, members]) => (
                <div key={gen} className="mb-12 fade-in">
                  {/* Generation Label */}
                  <div className="flex items-center gap-4 mb-6">
                    <span className="bg-orange-100 text-orange-700 text-sm font-semibold px-4 py-2 rounded-full">
                      Generation {gen}
                    </span>
                    <div className="flex-1 h-px bg-neutral-200"></div>
                    <span className="text-sm text-neutral-500">{members.length} members</span>
                  </div>

                  {/* Members Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger-animation">
                    {members.map((member, index) => (
                      <MemberCard
                        key={member.id}
                        member={member}
                        onClick={() => handleNodeClick(member)}
                        style={{ animationDelay: `${index * 50}ms` }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Bottom Sheet for Details */}
      <BottomSheet
        isOpen={isSheetOpen}
        onClose={closeSheet}
        member={selectedMember}
      />
    </div>
  );
}

function MemberCard({ member, onClick, style }) {
  return (
    <button
      onClick={onClick}
      className="modern-card p-4 w-full text-left card-interactive fade-in"
      style={style}
    >
      <div className="flex items-center gap-3">
        {/* Photo */}
        <div className="flex-shrink-0">
          {member.photo ? (
            <img
              src={`${API_URL}${member.photo}`}
              alt={member.name}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-neutral-100"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-orange-600 font-semibold text-lg">
              {member.name.charAt(0)}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-neutral-900 truncate">
            {member.name}
          </h3>
          <p className="text-sm text-neutral-600 truncate">
            {member.relationshipType}
          </p>
          <p className="text-xs text-neutral-500 truncate">
            via {member.connectedThrough}
          </p>
        </div>

        {/* Arrow */}
        <svg
          className="w-5 h-5 text-neutral-400 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </button>
  );
}

export default FamilyTree;
