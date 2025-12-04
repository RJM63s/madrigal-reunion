import { useEffect, useRef, useState } from 'react';

// Use environment variable, or empty string for same-origin requests in production
const API_URL = import.meta.env.VITE_API_URL || '';

function BottomSheet({ isOpen, onClose, member }) {
  const sheetRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);

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

  // Touch handlers for swipe-to-dismiss
  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartY(e.touches[0].clientY);
    setCurrentY(0);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const deltaY = e.touches[0].clientY - startY;
    // Only allow dragging down
    if (deltaY > 0) {
      setCurrentY(deltaY);
      if (sheetRef.current) {
        sheetRef.current.style.transform = `translateY(${deltaY}px)`;
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    // If dragged more than 100px, close the sheet
    if (currentY > 100) {
      onClose();
    } else {
      // Snap back
      if (sheetRef.current) {
        sheetRef.current.style.transform = '';
      }
    }
    setCurrentY(0);
  };

  if (!member) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={`bottom-sheet-overlay ${isOpen ? 'open' : ''}`}
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className={`bottom-sheet ${isOpen ? 'open' : ''} ${isDragging ? 'dragging' : ''}`}
      >
        {/* Handle - Swipe to dismiss */}
        <div
          className="flex justify-center py-4 cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="bottom-sheet-handle"></div>
        </div>

        {/* Content */}
        <div className="px-6 pb-8">
          {/* Photo */}
          {member.photo && (
            <div className="flex justify-center mb-6">
              <img
                src={`${API_URL}${member.photo}`}
                alt={member.name}
                className="w-32 h-32 rounded-full object-cover shadow-lg ring-4 ring-white"
              />
            </div>
          )}

          {/* Name */}
          <h2 className="text-2xl font-semibold text-center text-neutral-900 mb-6">
            {member.name}
          </h2>

          {/* Details Grid */}
          <div className="space-y-1">
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
            className="w-full mt-8 bg-orange-600 hover:bg-orange-700 text-white font-medium py-4 rounded-xl transition-all btn-press"
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
    <div className="flex justify-between items-start py-4 border-b border-neutral-100 last:border-0">
      <span className="text-sm font-medium text-neutral-500">{label}</span>
      <span className="text-sm text-neutral-900 text-right max-w-[60%] font-medium">{value}</span>
    </div>
  );
}

export default BottomSheet;
