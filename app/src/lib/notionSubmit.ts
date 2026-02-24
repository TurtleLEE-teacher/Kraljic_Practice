/**
 * Notion DB 전송 유틸리티
 *
 * 정적 사이트(GitHub Pages)에서 Notion API 직접 호출은 CORS 제한이 있으므로,
 * 중간 프록시(Notion Integration Proxy, Google Apps Script 등)를 통해 전송합니다.
 *
 * 사용법:
 * 1. Notion 데이터베이스 생성 (필드: 이름, 사분면, 점수, 등급, CE, SS, SV, 선택 등)
 * 2. 프록시 URL 설정 (Apps Script, Cloudflare Worker, 등)
 * 3. 대시보드에서 "결과 전송" 클릭
 */

import type { DashboardData, QuadrantId } from './types';
import { QUADRANT_META } from '@/data/quadrants';

const STORAGE_KEY = 'kraljic-notion-config';

export interface NotionConfig {
  proxyUrl: string;       // 프록시/웹훅 URL
  databaseId?: string;    // Notion DB ID (프록시가 필요한 경우)
}

/** localStorage에서 설정 불러오기 */
export function getNotionConfig(): NotionConfig | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** localStorage에 설정 저장 */
export function saveNotionConfig(config: NotionConfig): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

/** 설정 초기화 */
export function clearNotionConfig(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

/** DashboardData → 전송용 payload 변환 */
export function buildPayload(data: DashboardData) {
  const quadrantSummaries = data.quadrantResults.map((qr) => {
    const meta = QUADRANT_META[qr.quadrant as QuadrantId];
    const rawCe = qr.stepScores.reduce((s, ws) => s + ws.raw.ce, 0);
    const rawSs = qr.stepScores.reduce((s, ws) => s + ws.raw.ss, 0);
    const rawSv = qr.stepScores.reduce((s, ws) => s + ws.raw.sv, 0);

    return {
      quadrant: qr.quadrant,
      nameKo: meta?.nameKo ?? qr.quadrant,
      totalWeighted: qr.totalWeighted,
      percentOfOptimal: qr.percentOfOptimal,
      rawCe,
      rawSs,
      rawSv,
      choices: qr.choiceIds,
    };
  });

  return {
    sessionId: data.sessionId,
    participantName: data.participantName,
    layer1Score: data.layer1Score,
    layer2Score: data.layer2Score,
    finalScore: data.finalScore,
    grade: data.grade,
    profileType: data.dimensionProfile.strongest,
    quadrants: quadrantSummaries,
    submittedAt: new Date().toISOString(),
  };
}

export type SubmitStatus = 'idle' | 'sending' | 'success' | 'error';

/** 결과를 프록시/웹훅으로 전송 */
export async function submitToNotion(
  data: DashboardData,
  config: NotionConfig,
): Promise<{ ok: boolean; message: string }> {
  const payload = buildPayload(data);

  try {
    const body: Record<string, unknown> = { ...payload };
    if (config.databaseId) {
      body.databaseId = config.databaseId;
    }

    const res = await fetch(config.proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      return { ok: true, message: '전송 완료' };
    }

    const text = await res.text().catch(() => '');
    return { ok: false, message: `전송 실패 (${res.status}): ${text}` };
  } catch (err) {
    return {
      ok: false,
      message: `네트워크 오류: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
