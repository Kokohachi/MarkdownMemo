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
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3 px-4 py-4">
          <h1 className="text-xl font-bold text-slate-900">📝 MarkdownMemo</h1>
          <button
            onClick={() => router.push('/edit/new')}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <span>＋</span> 新規作成
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : notes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center shadow-sm">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-gray-500 text-lg mb-2">ノートがありません</p>
              <p className="text-gray-400 text-sm mb-6">「＋ 新規作成」ボタンでノートを作成してください</p>
              <button
                onClick={() => router.push('/edit/new')}
                className="rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
              >
                最初のノートを作成する
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6"
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
                        className="rounded-lg px-2 py-1 text-sm text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
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
