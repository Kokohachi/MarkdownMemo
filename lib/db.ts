import Dexie, { Table } from 'dexie';

export interface Note {
  id?: number;
  title: string;
  content: string;
  updatedAt: number;
}

export class AnkiNoteDB extends Dexie {
  notes!: Table<Note>;

  constructor() {
    super('AnkiNoteDB');
    this.version(1).stores({
      notes: '++id, title, updatedAt',
    });
  }
}

export const db = new AnkiNoteDB();
