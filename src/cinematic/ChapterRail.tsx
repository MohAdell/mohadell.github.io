export interface Chapter {
  id: string;
  label: string;
}

/** Scene index on the right edge: numbered chapters, the active one shows its section name. */
export default function ChapterRail({ chapters, active }: { chapters: Chapter[]; active: string }) {
  const activeIndex = Math.max(0, chapters.findIndex((c) => c.id === active));
  return (
    <nav className="chapter-rail" aria-label="Sections">
      <span className="chapter-count" aria-hidden="true">
        {String(activeIndex).padStart(2, '0')}
        <i>/</i>
        {String(chapters.length - 1).padStart(2, '0')}
      </span>
      <ol>
        {chapters.map((chapter, index) => (
          <li key={chapter.id}>
            <a
              href={`#${chapter.id}`}
              className="chapter-link"
              aria-current={chapter.id === active ? 'true' : undefined}
              aria-label={chapter.label}
            >
              <span className="chapter-label">{chapter.label}</span>
              <span className="chapter-tick" data-index={String(index).padStart(2, '0')} />
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
