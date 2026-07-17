import { useState, useEffect, useCallback } from 'react';
import React from 'react';
import { notesService } from '../../services/notesService';
import { NOTES_AUTOSAVE_DELAY_MS } from '../../utils/constants';
import { courseService } from '../../services/courseService';
import RichTextEditor from './RichTextEditor';
import { renderRichTextWithTimestamps } from '../../utils/timestampParser';

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


export default function NotesPanel({ lessonId, summary: initialSummary }: Props) {
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(true);
  const [tab, setTab] = useState<'edit' | 'view' | 'summary'>('edit');
  const [summary, setSummary] = useState<string | null | undefined>(initialSummary);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const currentLessonId = React.useRef(lessonId);

  useEffect(() => {
    currentLessonId.current = lessonId;
    setSummary(initialSummary);
    setIsGenerating(false);
    setGenerateError(null);
    notesService.getNotes(lessonId).then(n => setNotes(n));
  }, [lessonId, initialSummary]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSave = useCallback(
    debounce(async (value: string) => {
      await notesService.saveNotes(lessonId, value);
      setSaved(true);
    }, NOTES_AUTOSAVE_DELAY_MS),
    [lessonId],
  );

  const handleChange = (value: string) => {
    setNotes(value);
    setSaved(false);
    debouncedSave(value);
  };

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    setGenerateError(null);
    const targetLessonId = lessonId;
    try {
      const data = await courseService.generateSummary(targetLessonId);
      if (currentLessonId.current === targetLessonId) {
        setSummary(data.summary);
      }
    } catch (err: any) {
      if (currentLessonId.current === targetLessonId) {
        setGenerateError(err.response?.data?.detail || "Failed to generate summary.");
      }
    } finally {
      if (currentLessonId.current === targetLessonId) {
        setIsGenerating(false);
      }
    }
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
        <button
          className={`tab-btn ${tab === 'summary' ? 'active' : ''}`}
          onClick={() => setTab('summary')}
        >
          Summary
        </button>
        <span className="save-status">{saved ? '✓ Saved' : 'Saving…'}</span>
      </div>

      {tab === 'edit' ? (
        <div className="notes-textarea" style={{ padding: 0, overflow: 'hidden' }}>
          <RichTextEditor
            value={notes}
            onChange={handleChange}
          />
        </div>
      ) : tab === 'view' ? (
        <div className="notes-view summary-text" style={{ whiteSpace: 'pre-wrap' }}>
          {notes ? renderRichTextWithTimestamps(notes) : <span style={{ color: 'var(--text-muted)' }}>No notes yet. Switch to Edit to write some!</span>}
        </div>
      ) : (
        <div className="summary-text" style={{ whiteSpace: 'pre-wrap' }}>
          {summary ? (
            renderRichTextWithTimestamps(summary)
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>No AI summary has been generated for this video yet.</p>
              {generateError && <p style={{ color: 'var(--color-danger)', marginBottom: '1rem', fontSize: '0.9rem' }}>{generateError}</p>}
              <button 
                className="btn btn-primary" 
                onClick={handleGenerateSummary}
                disabled={isGenerating}
              >
                {isGenerating ? <><span className="spinner-sm" /> Generating…</> : '✨ Generate AI Summary'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
