import { useEffect, useState } from "react";
import { X } from "lucide-react";

// When loading stored value: split by comma or newline (allows sentences per keyword).
const INITIAL_VALUE_SEPARATOR = /[,\n\r]+/;

function splitKeywords(value) {
  return String(value || "")
    .split(INITIAL_VALUE_SEPARATOR)
    .map((part) => part.trim())
    .filter(Boolean);
}

function appendUnique(existing, additions) {
  const seen = new Set(existing.map((word) => word.toLowerCase()));
  const next = [...existing];
  additions.forEach((word) => {
    const key = word.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      next.push(word);
    }
  });
  return next;
}

export default function KeywordTagsInput({
  id,
  value,
  onChange,
  placeholder = "Type keyword or sentence and press Enter",
}) {
  const [keywords, setKeywords] = useState(splitKeywords(value));
  const [draft, setDraft] = useState("");

  useEffect(() => {
    setKeywords(splitKeywords(value));
  }, [value]);

  const commitKeywords = (nextKeywords) => {
    setKeywords(nextKeywords);
    onChange(nextKeywords.join(", "));
  };

  const commitDraft = () => {
    const normalized = draft.trim();
    if (!normalized) {
      setDraft("");
      return;
    }
    // Add the whole draft as one keyword (sentences allowed; no space-splitting).
    const nextKeywords = appendUnique(keywords, [normalized]);
    commitKeywords(nextKeywords);
    setDraft("");
  };

  const removeKeyword = (index) => {
    const nextKeywords = keywords.filter((_, i) => i !== index);
    commitKeywords(nextKeywords);
  };

  const onDraftChange = (e) => {
    const next = e.target.value;
    // Only newline creates new keywords; spaces are allowed (full sentences).
    if (/\n/.test(next)) {
      const parts = next.split(/\n/);
      const endsWithNewline = next.endsWith("\n");
      const toAdd = endsWithNewline ? parts : parts.slice(0, -1);
      const tail = endsWithNewline ? "" : (parts[parts.length - 1] ?? "");
      const sanitized = toAdd.map((part) => part.trim()).filter(Boolean);
      if (sanitized.length > 0) {
        commitKeywords(appendUnique(keywords, sanitized));
      }
      setDraft(tail);
      return;
    }
    setDraft(next);
  };

  return (
    <div className="mt-1 rounded-lg border border-border/70 bg-background px-2 py-2 focus-within:ring-2 focus-within:ring-ring">
      <div className="flex flex-wrap gap-2">
        {keywords.map((word, index) => (
          <span
            key={`${word}-${index}`}
            className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
          >
            {word}
            <button
              type="button"
              onClick={() => removeKeyword(index)}
              className="rounded-full p-0.5 text-primary/70 hover:bg-primary/20 hover:text-primary"
              aria-label={`Remove keyword ${word}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          onChange={onDraftChange}
          onBlur={commitDraft}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "Tab") {
              e.preventDefault();
              commitDraft();
              return;
            }
            if (e.key === "Backspace" && !draft && keywords.length > 0) {
              e.preventDefault();
              // Put last keyword into input for editing (don't delete outright).
              const last = keywords[keywords.length - 1];
              setKeywords(keywords.slice(0, -1));
              onChange(keywords.slice(0, -1).join(", "));
              setDraft(last);
            }
          }}
          className="min-w-[180px] flex-1 bg-transparent px-1 py-1 text-sm outline-none"
          placeholder={keywords.length === 0 ? placeholder : ""}
        />
      </div>
    </div>
  );
}

