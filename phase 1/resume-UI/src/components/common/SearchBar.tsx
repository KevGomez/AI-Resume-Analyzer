import { useState, useEffect, useRef } from "react";
import { useDebounce } from "../../hooks/useDebounce";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar = ({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}: SearchBarProps) => {
  const [localValue, setLocalValue] = useState(value);
  const debouncedValue = useDebounce(localValue, 300);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onChange(debouncedValue);
  }, [debouncedValue, onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  const handleClear = () => {
    setLocalValue("");
    inputRef.current?.focus();
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-secondary"
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
        </div>
        <input
          ref={inputRef}
          type="text"
          value={localValue}
          onChange={handleChange}
          className="block w-full pl-10 pr-10 py-2 bg-tertiary border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-primary placeholder-secondary"
          placeholder={placeholder}
        />
        {localValue && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-secondary hover:text-primary"
          >
            <svg
              className="h-5 w-5"
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
    </div>
  );
};
