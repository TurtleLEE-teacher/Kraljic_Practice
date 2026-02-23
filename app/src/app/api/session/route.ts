import { NextResponse } from 'next/server';
import { getDb, sessions } from '@/lib/db';

/**
 * POST /api/session
 * Create a new participant session.
 * Body: { sessionId: string, participantName: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, participantName } = body;

    if (!sessionId || !participantName) {
      return NextResponse.json(
        { error: 'sessionId and participantName are required' },
        { status: 400 },
      );
    }

    const db = getDb();
    db.insert(sessions).values({
      id: sessionId,
      participantName,
      createdAt: new Date().toISOString(),
    }).run();

    return NextResponse.json({ ok: true, sessionId });
  } catch (error) {
    console.error('POST /api/session error:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 },
    );
  }
}
