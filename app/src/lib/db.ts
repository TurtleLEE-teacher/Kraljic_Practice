import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

/**
 * sessions — one row per participant play-through.
 */
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  participantName: text('participant_name').notNull(),
  createdAt: text('created_at').notNull(),
  completedAt: text('completed_at'),
});

/**
 * submissions — Layer 1 step-level choices.
 * Each row represents one choice a participant made in a quadrant step.
 */
export const submissions = sqliteTable('submissions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sessionId: text('session_id')
    .notNull()
    .references(() => sessions.id),
  quadrant: text('quadrant').notNull(),
  step: integer('step').notNull(),
  choiceId: text('choice_id').notNull(),
  ceScore: real('ce_score').notNull(),
  ssScore: real('ss_score').notNull(),
  svScore: real('sv_score').notNull(),
  weightedScore: real('weighted_score').notNull(),
  timestamp: integer('timestamp').notNull(),
});

/**
 * eventResponses — Layer 2 event-level choices.
 * Each row represents one choice a participant made for a quadrant during the event phase.
 */
export const eventResponses = sqliteTable('event_responses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sessionId: text('session_id')
    .notNull()
    .references(() => sessions.id),
  quadrant: text('quadrant').notNull(),
  choiceId: text('choice_id').notNull(),
  ceScore: real('ce_score').notNull(),
  ssScore: real('ss_score').notNull(),
  svScore: real('sv_score').notNull(),
  weightedScore: real('weighted_score').notNull(),
  timestamp: integer('timestamp').notNull(),
});

// ---------------------------------------------------------------------------
// Database singleton
// ---------------------------------------------------------------------------

let db: ReturnType<typeof drizzle> | null = null;

/**
 * Lazily initialise and return the Drizzle-wrapped better-sqlite3 database.
 *
 * The SQLite file is stored at `data/kraljic.db` relative to the project root.
 * On first call the tables are created if they do not already exist.
 */
export function getDb() {
  if (db) return db;

  const sqlite = new Database('data/kraljic.db');

  // Enable WAL mode for better concurrent read performance
  sqlite.pragma('journal_mode = WAL');

  // Create tables if they don't exist
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      participant_name TEXT NOT NULL,
      created_at TEXT NOT NULL,
      completed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL REFERENCES sessions(id),
      quadrant TEXT NOT NULL,
      step INTEGER NOT NULL,
      choice_id TEXT NOT NULL,
      ce_score REAL NOT NULL,
      ss_score REAL NOT NULL,
      sv_score REAL NOT NULL,
      weighted_score REAL NOT NULL,
      timestamp INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS event_responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL REFERENCES sessions(id),
      quadrant TEXT NOT NULL,
      choice_id TEXT NOT NULL,
      ce_score REAL NOT NULL,
      ss_score REAL NOT NULL,
      sv_score REAL NOT NULL,
      weighted_score REAL NOT NULL,
      timestamp INTEGER NOT NULL
    );
  `);

  db = drizzle(sqlite);
  return db;
}
