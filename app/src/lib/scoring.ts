import type { ItemData, QuadrantId } from './types';

export type RiskLevel = 'LOW' | 'MID' | 'HIGH';

export interface KpiScore {
  num: string;
  name: string;
  value: number | null;
  unit: string;
  level: RiskLevel;
  score: number; // 1=LOW, 2=MID, 3=HIGH
}

function toScore(level: RiskLevel): number {
  return level === 'LOW' ? 1 : level === 'MID' ? 2 : 3;
}

function daysBetween(from: string, to: string) {
  return Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86_400_000);
}

export function computeSupplyRiskKpis(item: ItemData): KpiScore[] {
  const lts = item.deliveries.map(d => daysBetween(d.orderDate, d.actualDate));
  const n = lts.length;
  const avg = lts.reduce((a, b) => a + b, 0) / n;
  const sigma = Math.sqrt(lts.reduce((s, lt) => s + (lt - avg) ** 2, 0) / n);
  const cv = avg > 0 ? (sigma / avg) * 100 : 0;
  const onTime = item.deliveries.filter(d => d.actualDate <= d.plannedDate).length;
  const otd = (onTime / n) * 100;

  const supCount = item.suppliers.length;
  const totalAmt = item.suppliers.reduce((s, x) => s + x.annualAmount, 0);
  const maxAmt = Math.max(...item.suppliers.map(x => x.annualAmount));
  const conc = totalAmt > 0 ? (maxAmt / totalAmt) * 100 : 0;
  const subCount = item.suppliers.filter(x => x.substitutable === 'Y').length;

  const ltLevel: RiskLevel = avg <= 5 ? 'LOW' : avg <= 15 ? 'MID' : 'HIGH';
  const otdLevel: RiskLevel = otd >= 95 ? 'LOW' : otd >= 80 ? 'MID' : 'HIGH';
  const cvLevel: RiskLevel = cv < 20 ? 'LOW' : cv < 40 ? 'MID' : 'HIGH';
  const scLevel: RiskLevel = supCount >= 5 ? 'LOW' : supCount >= 3 ? 'MID' : 'HIGH';
  const concLevel: RiskLevel = conc < 30 ? 'LOW' : conc < 70 ? 'MID' : 'HIGH';
  const subLevel: RiskLevel = subCount >= 3 ? 'LOW' : subCount >= 1 ? 'MID' : 'HIGH';

  return [
    { num: '①', name: '평균 리드타임', value: avg, unit: '일', level: ltLevel, score: toScore(ltLevel) },
    { num: '②', name: '납기준수율', value: otd, unit: '%', level: otdLevel, score: toScore(otdLevel) },
    { num: '③', name: '리드타임 CV', value: cv, unit: '%', level: cvLevel, score: toScore(cvLevel) },
    { num: '④', name: '공급업체 수', value: supCount, unit: '개', level: scLevel, score: toScore(scLevel) },
    { num: '⑤', name: '1위 집중도', value: conc, unit: '%', level: concLevel, score: toScore(concLevel) },
    { num: '⑥', name: '대체 가능 업체', value: subCount, unit: '개', level: subLevel, score: toScore(subLevel) },
  ];
}

export function computeProfitImpactKpis(item: ItemData): KpiScore[] {
  const latest = item.spends[item.spends.length - 1];
  const ratio = (latest.itemSpend / latest.totalSpend) * 100;
  const ratioLevel: RiskLevel = ratio < 2 ? 'LOW' : ratio < 10 ? 'MID' : 'HIGH';

  let yoy: number | null = null;
  let yoyLevel: RiskLevel = 'LOW';
  if (item.spends.length >= 2) {
    const prev = item.spends[item.spends.length - 2];
    yoy = ((latest.itemSpend - prev.itemSpend) / prev.itemSpend) * 100;
    yoyLevel = yoy < 3 ? 'LOW' : yoy < 10 ? 'MID' : 'HIGH';
  }

  const spendRatios = item.spends.map(sp => (sp.itemSpend / sp.totalSpend) * 100);
  const avgSR = spendRatios.reduce((a, b) => a + b, 0) / spendRatios.length;
  const sigmaSR = Math.sqrt(spendRatios.reduce((s, r) => s + (r - avgSR) ** 2, 0) / spendRatios.length);
  const vol = avgSR > 0 ? (sigmaSR / avgSR) * 100 : 0;
  const volLevel: RiskLevel = vol < 10 ? 'LOW' : vol < 25 ? 'MID' : 'HIGH';

  const op = item.operationalImpact;
  const opLevel: RiskLevel = op <= 2 ? 'LOW' : op === 3 ? 'MID' : 'HIGH';

  return [
    { num: '⑦', name: '지출 비중', value: ratio, unit: '%', level: ratioLevel, score: toScore(ratioLevel) },
    { num: '⑧', name: 'YoY 증가율', value: yoy, unit: '%', level: yoyLevel, score: toScore(yoyLevel) },
    { num: '⑨', name: '가격 변동성', value: vol, unit: '%', level: volLevel, score: toScore(volLevel) },
    { num: '⑩', name: '운영 영향도', value: op, unit: '점', level: opLevel, score: toScore(opLevel) },
  ];
}

export function computeAxisScores(item: ItemData) {
  const srKpis = computeSupplyRiskKpis(item);
  const piKpis = computeProfitImpactKpis(item);

  const srScore = srKpis.reduce((s, k) => s + k.score, 0) / srKpis.length;
  const piScore = piKpis.reduce((s, k) => s + k.score, 0) / piKpis.length;

  const srHigh = srScore >= 2.0;
  const piHigh = piScore >= 2.0;

  let recommended: QuadrantId;
  if (srHigh && piHigh) recommended = 'strategic';
  else if (srHigh && !piHigh) recommended = 'bottleneck';
  else if (!srHigh && piHigh) recommended = 'leverage';
  else recommended = 'noncritical';

  return { srKpis, piKpis, srScore, piScore, recommended };
}
