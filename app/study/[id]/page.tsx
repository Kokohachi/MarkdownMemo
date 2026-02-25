'use client';

import { useEffect, useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { db, Note } from '@/lib/db';
import { parseMarkdown } from '@/lib/markdown';

interface PageProps {
  params: Promise<{ id: string }>;
}

type PdfMode = 'a' | 'b' | 'c';

export default function StudyPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [parsedHtml, setParsedHtml] = useState('');
  const [pdfMode, setPdfMode] = useState<PdfMode>('a');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const fetched = await db.notes.get(parseInt(id));
        if (fetched) {
          setNote(fetched);
          const html = parseMarkdown(fetched.content);
          setParsedHtml(html);
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Failed to fetch note:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [id, router]);

  useEffect(() => {
    if (!contentRef.current) return;

    const handleClick = (e: MouseEvent) => {
      const target = (e.target as Element).closest('.blank') as HTMLElement | null;
      if (!target) return;

      const currentState = parseInt(target.getAttribute('data-state') || '0');
      const nextState = (currentState + 1) % 3;
      target.setAttribute('data-state', String(nextState));

      const display = target.querySelector('.blank-display') as HTMLElement;
      if (!display) return;

      const word = decodeURIComponent(target.getAttribute('data-word') || '');
      const num = target.getAttribute('data-num') || '?';
      const firstChar = decodeURIComponent(target.getAttribute('data-first') || word.charAt(0));

      if (nextState === 0) {
        display.innerHTML = `[&nbsp;${num}&nbsp;]`;
      } else if (nextState === 1) {
        display.innerHTML = `[&nbsp;${firstChar}...&nbsp;]`;
      } else {
        display.innerHTML = `[&nbsp;${word}&nbsp;]`;
      }
    };

    const container = contentRef.current;
    container.addEventListener('click', handleClick);
    return () => container.removeEventListener('click', handleClick);
  }, [parsedHtml]);

  // Apply PDF mode class to body
  useEffect(() => {
    document.body.classList.remove('pdf-mode-a', 'pdf-mode-b', 'pdf-mode-c');
    document.body.classList.add(`pdf-mode-${pdfMode}`);

    if (contentRef.current) {
      const blanks = contentRef.current.querySelectorAll<HTMLElement>('.blank');
      blanks.forEach((blank) => {
        const word = decodeURIComponent(blank.getAttribute('data-word') || '');
        blank.setAttribute('data-word-decoded', word);

        const display = blank.querySelector('.blank-display') as HTMLElement;
        if (!display) return;

        if (pdfMode === 'a') {
          display.innerHTML = `[&nbsp;${word}&nbsp;]`;
        } else if (pdfMode === 'b') {
          const num = blank.getAttribute('data-num') || '?';
          display.innerHTML = `[&nbsp;${num}&nbsp;]`;
        } else {
          display.innerHTML = `[&nbsp;${word}&nbsp;]`;
        }
      });
    }

    return () => {
      document.body.classList.remove(`pdf-mode-${pdfMode}`);
    };
  }, [pdfMode, parsedHtml]);

  const handlePrint = () => {
    window.print();
  };

  const pdfModeLabels: Record<PdfMode, string> = {
    a: 'Mode A: 通常（解答表示）',
    b: 'Mode B: テスト用紙（穴埋め）',
    c: 'Mode C: 赤シート用',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8F9FA' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!note) return null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F9FA' }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 no-print">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm transition-colors"
          >
            ← 一覧へ
          </button>
          <div className="flex items-center gap-2">
            <select
              value={pdfMode}
              onChange={(e) => setPdfMode(e.target.value as PdfMode)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              {(Object.keys(pdfModeLabels) as PdfMode[]).map((mode) => (
                <option key={mode} value={mode}>
                  {pdfModeLabels[mode]}
                </option>
              ))}
            </select>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 bg-gray-800 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-gray-900 transition-colors"
            >
              🖨️ PDF出力
            </button>
            <button
              onClick={() => router.push(`/edit/${id}`)}
              className="flex items-center gap-1 text-gray-500 hover:text-gray-700 text-sm px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              ✏️ 編集
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 print-title">
          {note.title}
        </h1>
        
        {/* PDF mode indicator (screen only) */}
        <div className="no-print mb-4 flex items-center gap-2 text-sm text-gray-500">
          <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-xs font-medium">
            💡 穴埋め部分をタップすると状態が切り替わります
          </span>
        </div>

        <div
          ref={contentRef}
          className="bg-white rounded-xl border border-gray-200 p-8 markdown-body"
          dangerouslySetInnerHTML={{ __html: parsedHtml }}
        />
      </main>
    </div>
  );
}
