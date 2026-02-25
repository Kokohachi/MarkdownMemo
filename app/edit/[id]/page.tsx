'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/db';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const isNew = id === 'new';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  const SAMPLE_CONTENT = `# 暗記ノートのサンプル

## 使い方

\`{{単語}}\` を使うと穴埋め問題になります。
\`==重要な単語==\` でハイライトできます。

## 例

日本の首都は{{東京}}です。
==富士山==は日本最高峰で、標高は{{3776}}mです。

## もう少し複雑な例

- HTTPは{{HyperText Transfer Protocol}}の略です
- CSSは{{Cascading Style Sheets}}の略です
- ==JavaScript== は動的Webページを作るための言語です
`;

  useEffect(() => {
    if (isNew) {
      setContent(SAMPLE_CONTENT);
      return;
    }
    
    const fetchNote = async () => {
      try {
        const note = await db.notes.get(parseInt(id));
        if (note) {
          setTitle(note.title);
          setContent(note.content);
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
  }, [id, isNew, router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const now = Date.now();
      if (isNew) {
        const newId = await db.notes.add({
          title: title || '(タイトルなし)',
          content,
          updatedAt: now,
        });
        router.push(`/study/${newId}`);
      } else {
        await db.notes.update(parseInt(id), {
          title: title || '(タイトルなし)',
          content,
          updatedAt: now,
        });
        router.push(`/study/${id}`);
      }
    } catch (error) {
      console.error('Failed to save note:', error);
      alert('保存に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('このノートを削除しますか？')) return;
    try {
      await db.notes.delete(parseInt(id));
      router.push('/');
    } catch (error) {
      console.error('Failed to delete note:', error);
      alert('削除に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8F9FA' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-1 self-start rounded-full px-3 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            ← 一覧へ
          </button>
          <span className="font-semibold text-slate-700">
            {isNew ? '新規作成' : 'ノートを編集'}
          </span>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            {!isNew && (
              <button
                onClick={handleDelete}
                className="rounded-xl px-3 py-2 text-sm text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
              >
                削除
              </button>
            )}
            <button
              onClick={() => router.push(isNew ? '/' : `/study/${id}`)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-800"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存する'}
            </button>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="mx-auto w-full max-w-4xl space-y-4 px-4 py-6 sm:py-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="タイトルを入力..."
            className="w-full text-xl font-semibold text-gray-900 placeholder-gray-400 border-none outline-none bg-transparent"
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 pb-2 pt-3">
            <p className="text-xs text-slate-500">
              💡 <code className="rounded bg-slate-100 px-1">{'{{単語}}'}</code> で穴埋め、
              <code className="rounded bg-slate-100 px-1">{'==テキスト=='}</code> でハイライト
            </p>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Markdownで本文を入力..."
            className="h-[60vh] min-h-80 w-full resize-none border-none bg-transparent p-4 font-mono text-sm leading-relaxed text-gray-700 placeholder-gray-400 outline-none"
          />
        </div>
      </main>
    </div>
  );
}
