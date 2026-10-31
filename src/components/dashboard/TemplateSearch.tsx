interface TemplateSearchProps {
  query: string;
  onQueryChange: (query: string) => void;
}

export default function TemplateSearch({
  query,
  onQueryChange,
}: TemplateSearchProps) {
  return (
    <div className="search-header templates-search">
      <div className="search-field">
        <span aria-hidden="true">⌕</span>
        <input
          aria-label="템플릿 검색"
          placeholder="전체 검색"
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </div>
    </div>
  );
}
