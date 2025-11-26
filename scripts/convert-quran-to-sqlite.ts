import { readFile } from 'fs/promises';
import { join } from 'path';

import Database from 'better-sqlite3';

// Simple types based on assets/Quran.json structure
interface AyahJson {
  id: number;
  ar: string;
  en: string;
  filename: string;
  path: string;
  dir: string;
  size: number;
}

interface SurahJson {
  id: number;
  name: string;
  name_en: string;
  name_translation: string;
  words: number;
  letters: number;
  type: string;
  type_en: string;
  ar: string;
  en: string;
  array: AyahJson[];
}

async function main() {
  const projectRoot = process.cwd();
  const jsonPath = join(projectRoot, 'assets', 'Quran.json');
  const dbPath = join(projectRoot, 'assets', 'quran.sqlite');

  // eslint-disable-next-line no-console
  console.log('Reading JSON from', jsonPath);
  const jsonRaw = await readFile(jsonPath, 'utf-8');
  const jsonClean = jsonRaw.replace(/^\uFEFF/, '');
  const surahs: SurahJson[] = JSON.parse(jsonClean);

  // eslint-disable-next-line no-console
  console.log('Creating SQLite database at', dbPath);
  const db = new Database(dbPath);

  db.exec('PRAGMA foreign_keys = ON;');

  db.exec(`
    CREATE TABLE IF NOT EXISTS surahs (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      name_en TEXT NOT NULL,
      name_translation TEXT NOT NULL,
      words INTEGER NOT NULL,
      letters INTEGER NOT NULL,
      type TEXT NOT NULL,
      type_en TEXT NOT NULL,
      text_ar TEXT NOT NULL,
      text_en TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ayahs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      surah_id INTEGER NOT NULL,
      ayah_number INTEGER NOT NULL,
      text_ar TEXT NOT NULL,
      text_en TEXT NOT NULL,
      audio_filename TEXT,
      audio_path TEXT,
      audio_dir TEXT,
      audio_size INTEGER,
      FOREIGN KEY (surah_id) REFERENCES surahs(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_ayahs_surah_ayah ON ayahs(surah_id, ayah_number);
  `);

  const insertSurah = db.prepare(`
    INSERT OR REPLACE INTO surahs (
      id, name, name_en, name_translation, words, letters, type, type_en, text_ar, text_en
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `);

  const insertAyah = db.prepare(`
    INSERT INTO ayahs (
      surah_id, ayah_number, text_ar, text_en, audio_filename, audio_path, audio_dir, audio_size
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
  `);

  const insertSurahTxn = db.transaction((s: SurahJson) => {
    insertSurah.run(
      s.id,
      s.name,
      s.name_en,
      s.name_translation,
      s.words,
      s.letters,
      s.type,
      s.type_en,
      s.ar,
      s.en,
    );

    for (const ayah of s.array) {
      insertAyah.run(
        s.id,
        ayah.id,
        ayah.ar,
        ayah.en,
        ayah.filename,
        ayah.path,
        ayah.dir,
        ayah.size,
      );
    }
  });

  for (const surah of surahs) {
    insertSurahTxn(surah);
  }

  db.close();
  // eslint-disable-next-line no-console
  console.log('Done. SQLite DB created at', dbPath);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Error while converting Quran.json to SQLite:', err);
  process.exit(1);
});
