import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Filter, X, Calendar, DollarSign, User, Tag } from 'lucide-react';

interface SearchFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between';
  value: any;
  value2?: any; // for 'between' operator
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'customer' | 'payment_method' | 'status' | 'date_range';
  icon: React.ReactNode;
}

interface AdvancedSearchProps {
  onSearch: (query: string, filters: SearchFilter[]) => void;
  onClear: () => void;
  placeholder?: string;
  suggestions?: SearchSuggestion[];
  availableFilters?: string[];
  className?: string;
  debounceMs?: number;
}

const defaultSuggestions: SearchSuggestion[] = [
  { id: '1', text: 'Cash payments', type: 'payment_method', icon: <DollarSign className="w-4 h-4" /> },
  { id: '2', text: 'Pending dues', type: 'status', icon: <Tag className="w-4 h-4" /> },
  { id: '3', text: 'Last 30 days', type: 'date_range', icon: <Calendar className="w-4 h-4" /> },
  { id: '4', text: 'Active customers', type: 'status', icon: <User className="w-4 h-4" /> },
];

const availableFilterFields = [
  { key: 'amount', label: 'Amount', type: 'number' },
  { key: 'date', label: 'Date', type: 'date' },
  { key: 'status', label: 'Status', type: 'select' },
  { key: 'paymentMethod', label: 'Payment Method', type: 'select' },
  { key: 'customerName', label: 'Customer Name', type: 'text' },
];

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  onClear,
  placeholder = 'Search payments, dues, customers...',
  suggestions = defaultSuggestions,
  availableFilters = availableFilterFields,
  className = '',
  debounceMs = 300,
}) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilter[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim() || filters.length > 0) {
        onSearch(query, filters);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, filters, debounceMs, onSearch]);

  const filteredSuggestions = useMemo(() => {
    if (!query.trim()) return suggestions;
    
    return suggestions.filter(suggestion =>
      suggestion.text.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, suggestions]);

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    setShowSuggestions(value.length > 0);
    setActiveSuggestionIndex(-1);
  }, []);

  const handleSuggestionClick = useCallback((suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    setShowSuggestions(false);
    
    // Apply appropriate filter based on suggestion type
    switch (suggestion.type) {
      case 'payment_method':
        addFilter({
          field: 'paymentMethod',
          operator: 'equals',
          value: suggestion.text.toLowerCase().includes('cash') ? 'cash' : 'online'
        });
        break;
      case 'status':
        addFilter({
          field: 'status',
          operator: 'equals',
          value: suggestion.text.toLowerCase().includes('pending') ? 'pending' : 'active'
        });
        break;
      case 'date_range':
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        addFilter({
          field: 'date',
          operator: 'greater_than',
          value: thirtyDaysAgo.toISOString()
        });
        break;
    }
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveSuggestionIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (activeSuggestionIndex >= 0) {
          handleSuggestionClick(filteredSuggestions[activeSuggestionIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
        break;
    }
  }, [showSuggestions, filteredSuggestions, activeSuggestionIndex, handleSuggestionClick]);

  const addFilter = useCallback((filter: SearchFilter) => {
    setFilters(prev => {
      const existingIndex = prev.findIndex(f => f.field === filter.field);
      if (existingIndex >= 0) {
        const newFilters = [...prev];
        newFilters[existingIndex] = filter;
        return newFilters;
      }
      return [...prev, filter];
    });
  }, []);

  const removeFilter = useCallback((index: number) => {
    setFilters(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearAll = useCallback(() => {
    setQuery('');
    setFilters([]);
    setShowSuggestions(false);
    onClear();
  }, [onClear]);

  const renderFilterInput = (field: any) => {
    switch (field.type) {
      case 'number':
        return (
          <div className="flex items-center space-x-2">
            <select
              className="border border-gray-300 rounded px-2 py-1 text-sm"
              onChange={(e) => addFilter({ field: field.key, operator: e.target.value as any, value: '' })}
            >
              <option value="equals">Equals</option>
              <option value="greater_than">Greater than</option>
              <option value="less_than">Less than</option>
              <option value="between">Between</option>
            </select>
            <input
              type="number"
              className="border border-gray-300 rounded px-2 py-1 text-sm w-20"
              placeholder="Value"
              onChange={(e) => {
                const filter = filters.find(f => f.field === field.key);
                if (filter) {
                  addFilter({ ...filter, value: parseFloat(e.target.value) });
                }
              }}
            />
          </div>
        );
      case 'date':
        return (
          <div className="flex items-center space-x-2">
            <select
              className="border border-gray-300 rounded px-2 py-1 text-sm"
              onChange={(e) => addFilter({ field: field.key, operator: e.target.value as any, value: '' })}
            >
              <option value="equals">On</option>
              <option value="greater_than">After</option>
              <option value="less_than">Before</option>
              <option value="between">Between</option>
            </select>
            <input
              type="date"
              className="border border-gray-300 rounded px-2 py-1 text-sm"
              onChange={(e) => {
                const filter = filters.find(f => f.field === field.key);
                if (filter) {
                  addFilter({ ...filter, value: e.target.value });
                }
              }}
            />
          </div>
        );
      case 'select':
        const options = field.key === 'status' 
          ? ['pending', 'paid', 'overdue', 'active', 'inactive']
          : ['cash', 'online', 'card', 'bank_transfer'];
        
        return (
          <select
            className="border border-gray-300 rounded px-2 py-1 text-sm"
            onChange={(e) => addFilter({ field: field.key, operator: 'equals', value: e.target.value })}
          >
            <option value="">Select {field.label}</option>
            {options.map(option => (
              <option key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</option>
            ))}
          </select>
        );
      default:
        return (
          <input
            type="text"
            className="border border-gray-300 rounded px-2 py-1 text-sm"
            placeholder={`Search ${field.label.toLowerCase()}`}
            onChange={(e) => addFilter({ field: field.key, operator: 'contains', value: e.target.value })}
          />
        );
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => setShowSuggestions(query.length > 0)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="block w-full pl-10 pr-20 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-1 rounded-full hover:bg-gray-100 ${filters.length > 0 ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <Filter className="h-4 w-4" />
          </button>
          {(query || filters.length > 0) && (
            <button
              onClick={clearAll}
              className="ml-2 p-1 rounded-full hover:bg-gray-100 text-gray-400"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search Suggestions */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`w-full text-left px-4 py-2 flex items-center hover:bg-gray-50 ${
                index === activeSuggestionIndex ? 'bg-gray-100' : ''
              }`}
            >
              {suggestion.icon}
              <span className="ml-3">{suggestion.text}</span>
            </button>
          ))}
        </div>
      )}

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="absolute z-10 mt-2 w-full bg-white rounded-md shadow-lg border border-gray-200 p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-900">Advanced Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            {availableFilters.map((field) => (
              <div key={field.key} className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 w-32">
                  {field.label}
                </label>
                <div className="flex-1">
                  {renderFilterInput(field)}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={() => setFilters([])}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              Clear Filters
            </button>
            <button
              onClick={() => setShowFilters(false)}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {filters.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {filters.map((filter, index) => (
            <div key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
              <span>{filter.field}: {filter.operator} {filter.value}</span>
              <button
                onClick={() => removeFilter(index)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;