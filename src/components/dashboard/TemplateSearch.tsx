import { useRef } from "react";

interface TemplateSearchProps {
  query: string;
  onQueryChange: (query: string) => void;
}

export default function TemplateSearch({
  query,
  onQueryChange,
}: TemplateSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="search-header templates-search">
      <div className="search-field">
        <span aria-hidden="true">⌕</span>
        <input
          ref={inputRef}
          aria-label="템플릿 검색"
          placeholder="템플릿 검색"
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
        {query && (
          <button
            type="button"
            className="search-clear"
            aria-label="검색어 지우기"
            onClick={() => {
              onQueryChange("");
              inputRef.current?.focus();
            }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        )}
      </div>
    </div>
  );
}
