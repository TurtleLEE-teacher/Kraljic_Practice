import { NextResponse } from 'next/server';
import { getDb, sessions, submissions, eventResponses } from '@/lib/db';
import { eq, desc } from 'drizzle-orm';
import { QUADRANT_META, QUADRANT_ORDER } from '@/data/quadrants';
import type { QuadrantId, QuadrantResult, WeightedScore, DimensionProfile, Grade, DashboardData } from '@/lib/types';

function getOptimalScore(quadrant: QuadrantId): number {
  const w = QUADRANT_META[quadrant].weights;
  return 4 * (5 * w.ce + 5 * w.ss + 5 * w.sv);
}

function determineGrade(score: number): Grade {
  if (score >= 70) return 'Excellent';
  if (score >= 55) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Poor';
}

/**
 * GET /api/results?sessionId=xxx
 * Return full dashboard data for a session including rank.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    const db = getDb();

    // Fetch session
    const sessionRows = db.select().from(sessions).where(eq(sessions.id, sessionId)).all();
    if (sessionRows.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    const session = sessionRows[0];

    // Fetch submissions
    const subs = db.select().from(submissions).where(eq(submissions.sessionId, sessionId)).all();

    // Fetch event responses
    const events = db.select().from(eventResponses).where(eq(eventResponses.sessionId, sessionId)).all();

    // Build quadrant results
    const quadrantResults: QuadrantResult[] = QUADRANT_ORDER.map((qId) => {
      const qSubs = subs.filter((s) => s.quadrant === qId).sort((a, b) => a.step - b.step);
      const stepScores: WeightedScore[] = qSubs.map((s) => ({
        raw: { ce: s.ceScore, ss: s.ssScore, sv: s.svScore },
        weighted: s.weightedScore,
      }));
      const totalWeighted = parseFloat(stepScores.reduce((sum, s) => sum + s.weighted, 0).toFixed(2));
      const optimalScore = getOptimalScore(qId);
      const percentOfOptimal = parseFloat(((totalWeighted / optimalScore) * 100).toFixed(1));

      return {
        quadrant: qId,
        stepScores,
        totalWeighted,
        choiceIds: qSubs.map((s) => s.choiceId),
        optimalScore,
        percentOfOptimal,
      };
    });

    const layer1Score = parseFloat(quadrantResults.reduce((sum, qr) => sum + qr.totalWeighted, 0).toFixed(2));

    // Event results
    const eventResults = QUADRANT_ORDER.map((qId) => {
      const ev = events.find((e) => e.quadrant === qId);
      return {
        quadrant: qId,
        choiceId: ev?.choiceId || '',
        score: ev
          ? { raw: { ce: ev.ceScore, ss: ev.ssScore, sv: ev.svScore }, weighted: ev.weightedScore }
          : { raw: { ce: 0, ss: 0, sv: 0 }, weighted: 0 },
      };
    });

    const layer2Score = parseFloat(eventResults.reduce((sum, er) => sum + er.score.weighted, 0).toFixed(2));
    const finalScore = parseFloat((layer1Score + layer2Score).toFixed(2));
    const grade = determineGrade(finalScore);

    // Dimension profile
    const dimensionProfile = computeDimensionProfile(quadrantResults);

    // Rank calculation: compare with all completed sessions
    let rank: { before: number; after: number; total: number } | undefined;
    const allCompleted = db.select().from(sessions).all();
    if (allCompleted.length > 1) {
      const allScores: { id: string; layer1: number; final: number }[] = [];

      for (const s of allCompleted) {
        const sSubs = db.select().from(submissions).where(eq(submissions.sessionId, s.id)).all();
        const sEvents = db.select().from(eventResponses).where(eq(eventResponses.sessionId, s.id)).all();
        if (sSubs.length === 0) continue;

        const l1 = parseFloat(sSubs.reduce((sum, sub) => sum + sub.weightedScore, 0).toFixed(2));
        const l2 = parseFloat(sEvents.reduce((sum, ev) => sum + ev.weightedScore, 0).toFixed(2));
        allScores.push({ id: s.id, layer1: l1, final: parseFloat((l1 + l2).toFixed(2)) });
      }

      if (allScores.length > 0) {
        const sortedByL1 = [...allScores].sort((a, b) => b.layer1 - a.layer1);
        const sortedByFinal = [...allScores].sort((a, b) => b.final - a.final);

        const rankBefore = sortedByL1.findIndex((s) => s.id === sessionId) + 1;
        const rankAfter = sortedByFinal.findIndex((s) => s.id === sessionId) + 1;

        rank = {
          before: rankBefore || allScores.length,
          after: rankAfter || allScores.length,
          total: allScores.length,
        };
      }
    }

    const data: DashboardData = {
      sessionId,
      participantName: session.participantName,
      layer1Score,
      layer2Score,
      finalScore,
      grade,
      quadrantResults,
      eventResults,
      dimensionProfile,
      rank,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('GET /api/results error:', error);
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 });
  }
}

function computeDimensionProfile(quadrantResults: QuadrantResult[]): DimensionProfile {
  let ceTotal = 0;
  let ssTotal = 0;
  let svTotal = 0;
  let stepCount = 0;

  for (const qr of quadrantResults) {
    for (const ws of qr.stepScores) {
      ceTotal += ws.raw.ce;
      ssTotal += ws.raw.ss;
      svTotal += ws.raw.sv;
      stepCount++;
    }
  }

  const ceAvg = stepCount > 0 ? ceTotal / stepCount : 0;
  const ssAvg = stepCount > 0 ? ssTotal / stepCount : 0;
  const svAvg = stepCount > 0 ? svTotal / stepCount : 0;

  const scores = { ce: ceTotal, ss: ssTotal, sv: svTotal };
  const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);
  const strongest = sorted[0][0] as 'ce' | 'ss' | 'sv';
  const weakest = sorted[sorted.length - 1][0] as 'ce' | 'ss' | 'sv';

  return {
    ce: { total: ceTotal, average: parseFloat(ceAvg.toFixed(2)) },
    ss: { total: ssTotal, average: parseFloat(ssAvg.toFixed(2)) },
    sv: { total: svTotal, average: parseFloat(svAvg.toFixed(2)) },
    strongest,
    weakest,
  };
}
