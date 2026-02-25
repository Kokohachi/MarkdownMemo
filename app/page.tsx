'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db, Note } from '@/lib/db';

export default function ListPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const allNotes = await db.notes.orderBy('updatedAt').reverse().toArray();
        setNotes(allNotes);
      } catch (error) {
        console.error('Failed to fetch notes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="app-shell min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white">
      {/* Header */}
      <header className="app-header sticky top-0 z-10 border-b border-slate-200/80 bg-white/85 backdrop-blur">
        <div className="app-header-inner mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-4">
          <h1 className="rounded-xl bg-slate-100 px-3 py-1 text-lg font-bold tracking-tight text-slate-900">📝 MarkdownMemo</h1>
          <button
            onClick={() => router.push('/edit/new')}
            className="ui-btn-primary inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <span>＋</span> 新規作成
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="app-main mx-auto w-full max-w-5xl px-4 py-6 sm:py-8">
        <section className="ui-panel mb-6 rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-slate-900">ノート一覧</h2>
          <p className="mt-1 text-sm text-slate-500">Markdownで作った暗記メモを、ここから学習できます。</p>
        </section>
        {loading ? (
          <div className="flex items-center justify-center rounded-3xl border border-slate-200/80 bg-white/90 py-20 shadow-sm">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : notes.length === 0 ? (
            <div className="ui-panel rounded-2xl border border-slate-200 bg-white py-16 text-center shadow-sm">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-gray-500 text-lg mb-2">ノートがありません</p>
              <p className="text-gray-400 text-sm mb-6">「＋ 新規作成」ボタンでノートを作成してください</p>
              <button
                onClick={() => router.push('/edit/new')}
                 className="ui-btn-primary rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
              >
                最初のノートを作成する
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="ui-panel cursor-pointer rounded-3xl border border-slate-200/90 bg-white/95 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md sm:p-6"
                  onClick={() => router.push(`/study/${note.id}`)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h2 className="font-semibold text-gray-900 text-lg truncate">
                        {note.title || '(タイトルなし)'}
                      </h2>
                      <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                        {note.content.replace(/[#*`_\[\]{}=]/g, '').slice(0, 100)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="text-gray-400 text-xs">{formatDate(note.updatedAt)}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/edit/${note.id}`);
                        }}
                        className="ui-btn-secondary rounded-lg px-2 py-1 text-sm text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                      >
                        編集
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      </main>
    </div>
  );
}
