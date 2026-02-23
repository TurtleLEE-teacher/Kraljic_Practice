import { NextResponse } from 'next/server';
import { getDb, eventResponses, sessions } from '@/lib/db';
import { eq } from 'drizzle-orm';

/**
 * POST /api/event
 * Persist Layer 2 event responses (all 4 quadrants at once).
 * Body: { sessionId, responses: Array<{ quadrant, choiceId, ceScore, ssScore, svScore, weightedScore }> }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, responses } = body;

    if (!sessionId || !Array.isArray(responses) || responses.length === 0) {
      return NextResponse.json(
        { error: 'sessionId and responses array are required' },
        { status: 400 },
      );
    }

    const db = getDb();
    const now = Date.now();

    for (const r of responses) {
      db.insert(eventResponses).values({
        sessionId,
        quadrant: r.quadrant,
        choiceId: r.choiceId,
        ceScore: r.ceScore,
        ssScore: r.ssScore,
        svScore: r.svScore,
        weightedScore: r.weightedScore,
        timestamp: now,
      }).run();
    }

    // Mark session as completed
    db.update(sessions)
      .set({ completedAt: new Date().toISOString() })
      .where(eq(sessions.id, sessionId))
      .run();

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('POST /api/event error:', error);
    return NextResponse.json(
      { error: 'Failed to save event responses' },
      { status: 500 },
    );
  }
}
