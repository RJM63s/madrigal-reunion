import { useEffect, useState } from 'react';
import BottomSheet from '../components/BottomSheet';

function FamilyTree() {
  const [familyData, setFamilyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  useEffect(() => {
    fetch('http://localhost:3001/api/family')
      .then(res => res.json())
      .then(data => {
        // Sort by generation for timeline
        const sorted = data.sort((a, b) => a.generation - b.generation);
        setFamilyData(sorted);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching family data:', err);
        setLoading(false);
      });
  }, []);

  const handleNodeClick = (member) => {
    setSelectedMember(member);
    setIsSheetOpen(true);
  };

  const closeSheet = () => {
    setIsSheetOpen(false);
    setTimeout(() => setSelectedMember(null), 300);
  };

  // Group by generation
  const generations = familyData.reduce((acc, member) => {
    if (!acc[member.generation]) {
      acc[member.generation] = [];
    }
    acc[member.generation].push(member);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-neutral-500">Loading...</div>
      </div>
    );
  }

  if (familyData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen px-6 text-center">
        <div className="text-4xl mb-4">🌳</div>
        <h2 className="text-2xl font-semibold text-neutral-900 mb-2">
          No family members yet
        </h2>
        <p className="text-neutral-600">
          Be the first to register and start the family tree
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white md:bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-semibold text-neutral-900 mb-2">Family Tree</h1>
          <p className="text-neutral-600">{familyData.length} family members</p>
        </div>
      </div>

      {/* Horizontal Timeline - Mobile first */}
      <div className="md:hidden">
        <div className="horizontal-scroll p-6">
          <div className="inline-flex gap-8 min-w-full">
            {Object.entries(generations).map(([gen, members]) => (
              <div key={gen} className="flex-shrink-0" style={{ width: '280px' }}>
                {/* Generation Label */}
                <div className="mb-6 sticky left-0">
                  <span className="inline-block bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full">
                    Generation {gen}
                  </span>
                </div>

                {/* Members in this generation */}
                <div className="space-y-4">
                  {members.map((member) => (
                    <MemberCard
                      key={member.id}
                      member={member}
                      onClick={() => handleNodeClick(member)}
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
            <div key={gen} className="mb-12">
              {/* Generation Label */}
              <div className="flex items-center gap-4 mb-6">
                <span className="bg-orange-100 text-orange-700 text-sm font-semibold px-4 py-2 rounded-full">
                  Generation {gen}
                </span>
                <div className="flex-1 h-px bg-neutral-200"></div>
              </div>

              {/* Members Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {members.map((member) => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    onClick={() => handleNodeClick(member)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Sheet for Details */}
      <BottomSheet
        isOpen={isSheetOpen}
        onClose={closeSheet}
        member={selectedMember}
      />
    </div>
  );
}

function MemberCard({ member, onClick }) {
  return (
    <button
      onClick={onClick}
      className="modern-card p-4 w-full text-left hover:shadow-md active:scale-98 transition-all"
    >
      <div className="flex items-center gap-3">
        {/* Photo */}
        <div className="flex-shrink-0">
          {member.photo ? (
            <img
              src={`http://localhost:3001${member.photo}`}
              alt={member.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-500 font-medium text-lg">
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
