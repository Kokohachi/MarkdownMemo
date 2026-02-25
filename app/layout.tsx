import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MarkdownMemo',
  description: 'Markdownから暗記学習カードを作成するSPA',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
