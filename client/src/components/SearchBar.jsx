import { useState, useRef, useEffect } from 'react';

function SearchBar({ onSearch, placeholder = "Search family members..." }) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    onSearch(query);
  }, [query, onSearch]);

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <div
      className={`search-bar ${isFocused ? 'focused' : ''}`}
    >
      {/* Search Icon */}
      <svg
        className="search-bar-icon"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="search-bar-input"
      />

      {/* Clear Button */}
      {query && (
        <button
          onClick={handleClear}
          className="search-bar-clear"
          type="button"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

export default SearchBar;
