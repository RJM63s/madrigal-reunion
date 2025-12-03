import { useEffect } from 'react';

function BottomSheet({ isOpen, onClose, member }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!member) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={`bottom-sheet-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div className={`bottom-sheet ${isOpen ? 'open' : ''}`}>
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="w-12 h-1 bg-neutral-300 rounded-full"></div>
        </div>

        {/* Content */}
        <div className="px-6 pb-8">
          {/* Photo */}
          {member.photo && (
            <div className="flex justify-center mb-6">
              <img
                src={`http://localhost:3001${member.photo}`}
                alt={member.name}
                className="w-32 h-32 rounded-full object-cover shadow-lg"
              />
            </div>
          )}

          {/* Name */}
          <h2 className="text-2xl font-semibold text-center text-neutral-900 mb-6">
            {member.name}
          </h2>

          {/* Details Grid */}
          <div className="space-y-4">
            <DetailItem label="Relationship" value={member.relationshipType} />
            <DetailItem label="Connected Through" value={member.connectedThrough} />
            <DetailItem label="Generation" value={`Generation ${member.generation}`} />
            <DetailItem label="Family Branch" value={member.familyBranch} />
            <DetailItem label="Attendees" value={member.attendees?.toString()} />
            {member.email && <DetailItem label="Email" value={member.email} />}
            {member.phone && <DetailItem label="Phone" value={member.phone} />}
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full mt-8 bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}

function DetailItem({ label, value }) {
  if (!value) return null;

  return (
    <div className="flex justify-between items-start py-3 border-b border-neutral-200 last:border-0">
      <span className="text-sm font-medium text-neutral-500">{label}</span>
      <span className="text-sm text-neutral-900 text-right max-w-[60%]">{value}</span>
    </div>
  );
}

export default BottomSheet;
