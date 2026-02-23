import type { EventData } from '@/lib/types';

// Stub file — Agent 1 will replace with full event data
export const eventData: EventData = {
  background: {
    title: '글로벌 공급망 위기 발생',
    description: '이벤트 데이터가 준비 중입니다. Agent 1이 실제 시나리오 데이터를 추가할 예정입니다.',
    shocks: [
      { name: '충격 1', description: '데이터 준비 중', timeframe: '-' },
      { name: '충격 2', description: '데이터 준비 중', timeframe: '-' },
      { name: '충격 3', description: '데이터 준비 중', timeframe: '-' },
    ],
  },
  responses: [
    {
      quadrantId: 'bottleneck',
      situation: '병목 품목에 대한 이벤트 상황이 준비 중입니다.',
      choices: [
        { id: 'event_bottleneck_A', label: 'A', title: '대응 A', description: '', scores: { ce: 3, ss: 3, sv: 3 }, feedback: { result: '', tradeoff: '', theoryConnection: '' } },
        { id: 'event_bottleneck_B', label: 'B', title: '대응 B', description: '', scores: { ce: 3, ss: 3, sv: 3 }, feedback: { result: '', tradeoff: '', theoryConnection: '' } },
        { id: 'event_bottleneck_C', label: 'C', title: '대응 C', description: '', scores: { ce: 3, ss: 3, sv: 3 }, feedback: { result: '', tradeoff: '', theoryConnection: '' } },
      ],
    },
    {
      quadrantId: 'leverage',
      situation: '레버리지 품목에 대한 이벤트 상황이 준비 중입니다.',
      choices: [
        { id: 'event_leverage_A', label: 'A', title: '대응 A', description: '', scores: { ce: 3, ss: 3, sv: 3 }, feedback: { result: '', tradeoff: '', theoryConnection: '' } },
        { id: 'event_leverage_B', label: 'B', title: '대응 B', description: '', scores: { ce: 3, ss: 3, sv: 3 }, feedback: { result: '', tradeoff: '', theoryConnection: '' } },
        { id: 'event_leverage_C', label: 'C', title: '대응 C', description: '', scores: { ce: 3, ss: 3, sv: 3 }, feedback: { result: '', tradeoff: '', theoryConnection: '' } },
      ],
    },
    {
      quadrantId: 'strategic',
      situation: '전략 품목에 대한 이벤트 상황이 준비 중입니다.',
      choices: [
        { id: 'event_strategic_A', label: 'A', title: '대응 A', description: '', scores: { ce: 3, ss: 3, sv: 3 }, feedback: { result: '', tradeoff: '', theoryConnection: '' } },
        { id: 'event_strategic_B', label: 'B', title: '대응 B', description: '', scores: { ce: 3, ss: 3, sv: 3 }, feedback: { result: '', tradeoff: '', theoryConnection: '' } },
        { id: 'event_strategic_C', label: 'C', title: '대응 C', description: '', scores: { ce: 3, ss: 3, sv: 3 }, feedback: { result: '', tradeoff: '', theoryConnection: '' } },
      ],
    },
    {
      quadrantId: 'noncritical',
      situation: '일상 품목에 대한 이벤트 상황이 준비 중입니다.',
      choices: [
        { id: 'event_noncritical_A', label: 'A', title: '대응 A', description: '', scores: { ce: 3, ss: 3, sv: 3 }, feedback: { result: '', tradeoff: '', theoryConnection: '' } },
        { id: 'event_noncritical_B', label: 'B', title: '대응 B', description: '', scores: { ce: 3, ss: 3, sv: 3 }, feedback: { result: '', tradeoff: '', theoryConnection: '' } },
        { id: 'event_noncritical_C', label: 'C', title: '대응 C', description: '', scores: { ce: 3, ss: 3, sv: 3 }, feedback: { result: '', tradeoff: '', theoryConnection: '' } },
      ],
    },
  ],
};

