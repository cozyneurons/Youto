import { useState, useEffect, useCallback } from 'react';
import React from 'react';
import { notesService } from '../../services/notesService';
import { NOTES_AUTOSAVE_DELAY_MS } from '../../utils/constants';
import { seekVideo, timeToSeconds } from '../../utils/videoControl';

interface Props {
  lessonId: number;
  summary?: string | null;
}

function debounce<T extends (...args: any[]) => void>(fn: T, ms: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

function renderWithTimestamps(text: string | null | undefined) {
  if (!text) return null;
  // Match timestamps like MM:SS or HH:MM:SS
  const regex = /(\b\d{1,2}:\d{2}(?::\d{2})?\b)/g;
  const parts = text.split(regex);
  return parts.map((part, i) => {
    if (regex.test(part)) {
      return (
        <button
          key={i}
          className="timestamp-btn"
          onClick={() => seekVideo(timeToSeconds(part))}
          title="Jump to this time"
        >
          {part}
        </button>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

export default function NotesPanel({ lessonId, summary }: Props) {
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(true);
  const [tab, setTab] = useState<'edit' | 'view' | 'summary'>('edit');

  useEffect(() => {
    notesService.getNotes(lessonId).then(n => setNotes(n));
  }, [lessonId]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce(async (value: string) => {
      await notesService.saveNotes(lessonId, value);
      setSaved(true);
    }, NOTES_AUTOSAVE_DELAY_MS),
    [lessonId],
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    setSaved(false);
    debouncedSave(e.target.value);
  };

  return (
    <div className="notes-panel">
      <div className="notes-tabs">
        <button
          className={`tab-btn ${tab === 'edit' ? 'active' : ''}`}
          onClick={() => setTab('edit')}
        >
          Edit Notes
        </button>
        <button
          className={`tab-btn ${tab === 'view' ? 'active' : ''}`}
          onClick={() => setTab('view')}
        >
          View Notes
        </button>
        {summary && (
          <button
            className={`tab-btn ${tab === 'summary' ? 'active' : ''}`}
            onClick={() => setTab('summary')}
          >
            Summary
          </button>
        )}
        <span className="save-status">{saved ? '✓ Saved' : 'Saving…'}</span>
      </div>

      {tab === 'edit' ? (
        <textarea
          id="lesson-notes"
          className="notes-textarea"
          value={notes}
          onChange={handleChange}
          placeholder="Write your notes here… (auto-saved)"
          spellCheck
        />
      ) : tab === 'view' ? (
        <div className="notes-view summary-text" style={{ whiteSpace: 'pre-wrap' }}>
          {notes ? renderWithTimestamps(notes) : <span style={{ color: 'var(--text-muted)' }}>No notes yet. Switch to Edit to write some!</span>}
        </div>
      ) : (
        <div className="summary-text" style={{ whiteSpace: 'pre-wrap' }}>
          {renderWithTimestamps(summary)}
        </div>
      )}
    </div>
  );
}
