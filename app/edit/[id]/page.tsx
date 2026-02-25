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
    <div className="min-h-screen" style={{ backgroundColor: '#F8F9FA' }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm transition-colors"
          >
            ← 一覧へ
          </button>
          <span className="font-semibold text-gray-700">
            {isNew ? '新規作成' : 'ノートを編集'}
          </span>
          <div className="flex items-center gap-2">
            {!isNew && (
              <button
                onClick={handleDelete}
                className="text-red-500 hover:text-red-700 text-sm px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
              >
                削除
              </button>
            )}
            <button
              onClick={() => router.push(isNew ? '/' : `/study/${id}`)}
              className="text-gray-500 hover:text-gray-700 text-sm px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
            >
              {saving ? '保存中...' : '保存する'}
            </button>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="タイトルを入力..."
            className="w-full text-xl font-semibold text-gray-900 placeholder-gray-400 border-none outline-none bg-transparent"
          />
        </div>

        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-4 pt-3 pb-2 border-b border-gray-100">
            <p className="text-xs text-gray-400">
              💡 <code className="bg-gray-100 px-1 rounded">{'{{単語}}'}</code> で穴埋め、
              <code className="bg-gray-100 px-1 rounded">{'==テキスト=='}</code> でハイライト
            </p>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Markdownで本文を入力..."
            className="w-full h-96 p-4 text-gray-700 placeholder-gray-400 border-none outline-none resize-none bg-transparent font-mono text-sm leading-relaxed"
          />
        </div>
      </main>
    </div>
  );
}
