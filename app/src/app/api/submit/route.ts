import { NextResponse } from 'next/server';
import { getDb, submissions } from '@/lib/db';

/**
 * POST /api/submit
 * Persist a Layer 1 step choice.
 * Body: { sessionId, quadrant, step, choiceId, ceScore, ssScore, svScore, weightedScore }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId, quadrant, step, choiceId, ceScore, ssScore, svScore, weightedScore } = body;

    if (!sessionId || !quadrant || step === undefined || !choiceId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    const db = getDb();
    db.insert(submissions).values({
      sessionId,
      quadrant,
      step,
      choiceId,
      ceScore,
      ssScore,
      svScore,
      weightedScore,
      timestamp: Date.now(),
    }).run();

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('POST /api/submit error:', error);
    return NextResponse.json(
      { error: 'Failed to save submission' },
      { status: 500 },
    );
  }
}
