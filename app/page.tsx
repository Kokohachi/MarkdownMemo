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
    <div className="min-h-screen" style={{ backgroundColor: '#F8F9FA' }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">📝 MarkdownMemo</h1>
          <button
            onClick={() => router.push('/edit/new')}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <span>＋</span> 新規作成
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📄</div>
            <p className="text-gray-500 text-lg mb-2">ノートがありません</p>
            <p className="text-gray-400 text-sm mb-6">「＋ 新規作成」ボタンでノートを作成してください</p>
            <button
              onClick={() => router.push('/edit/new')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              最初のノートを作成する
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
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
                      className="text-gray-400 hover:text-gray-600 text-sm px-2 py-1 rounded hover:bg-gray-100 transition-colors"
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
