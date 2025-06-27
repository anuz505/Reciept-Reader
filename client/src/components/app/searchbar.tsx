import React, { useState } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string, filter: string) => void;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, className = "" }) => {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query, filter);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search receipts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="py-2 px-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Fields</option>
          <option value="business">Business</option>
          <option value="items">Items</option>
          <option value="date">Date</option>
        </select>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Search
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
