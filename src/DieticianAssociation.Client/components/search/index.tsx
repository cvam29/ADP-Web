import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Clock, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  onSearch: (query: string) => void
  onSuggestionSelect: (suggestion: string) => void
  placeholder?: string
  suggestions?: string[]
  recentSearches?: string[]
  loading?: boolean
  className?: string
}

export function SearchInput({
  value,
  onChange,
  onSearch,
  onSuggestionSelect,
  placeholder = "Search...",
  suggestions = [],
  recentSearches = [],
  loading = false,
  className
}: SearchInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(value)
    setShowSuggestions(false)
  }

  const handleSuggestionClick = (suggestion: string) => {
    onSuggestionSelect(suggestion)
    setShowSuggestions(false)
  }

  return (
    <div className={cn("relative", className)}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 animate-spin" />
        )}
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || recentSearches.length > 0) && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
          {suggestions.length > 0 && (
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 mb-1">Suggestions</div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded text-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
          
          {recentSearches.length > 0 && (
            <div className="p-2 border-t">
              <div className="text-xs font-medium text-gray-500 mb-1 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                Recent
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(search)}
                  className="w-full text-left px-2 py-1 hover:bg-gray-100 rounded text-sm text-gray-600"
                >
                  {search}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface SearchStatsProps {
  totalResults: number
  queryTime: number
  query: string
}

export function SearchStats({ totalResults, queryTime, query }: SearchStatsProps) {
  if (!query && totalResults === 0) return null

  return (
    <div className="text-sm text-gray-600">
      {query ? (
        <>
          Found <span className="font-medium">{totalResults}</span> results for &ldquo;
          <span className="font-medium">{query}</span>&rdquo; in {queryTime.toFixed(2)}ms
        </>
      ) : (
        <>
          Showing <span className="font-medium">{totalResults}</span> resources
        </>
      )}
    </div>
  )
}

interface SearchFiltersProps {
  filters: Record<string, any>
  onFilterChange: (key: string, value: any) => void
  onClearFilters: () => void
}

export function SearchFilters({ filters, onFilterChange, onClearFilters }: SearchFiltersProps) {
  const activeFilters = Object.entries(filters).filter(([key, value]) => 
    value && value !== "All" && value !== ""
  )

  if (activeFilters.length === 0) return null

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-gray-500">Active filters:</span>
      {activeFilters.map(([key, value]) => (
        <Badge
          key={key}
          variant="secondary"
          className="cursor-pointer hover:bg-gray-200"
          onClick={() => onFilterChange(key, "All")}
        >
          {key}: {value} ×
        </Badge>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearFilters}
        className="text-xs"
      >
        Clear all
      </Button>
    </div>
  )
}
