export const demoGraphData: GraphData = {
  root: 0,
  keywords: [
    '기계학습',
    '뇌파 데이터',
    '감정분류',
    '정확도 향상',
    '한국 인터넷 정보학회',
    'EEG Testing',
    '샘플링',
    '유한 임펄스 응답 필터',
    '주파수대역',
    '뇌파 파형',
    '쎄타',
    '슬로 알파',
    '알파',
    '베타',
    '감마',
    '독립성분분석',
    'CSV 데이터',
    '정서적인 데이터',
    '각성',
    '정서가',
    '우성',
    '애호',
    '감정',
    '랜덤 포레스트',
    '속성 선택적 분류기',
    '특징선택',
    '속성 부분집합 선택',
    '휴리스틱 검색전략',
    '최상위 검색',
    '상관관계에 의한 속성 부분집합 선택',
    '실험결과',
    '정확도',
    'EEGLAB',
    'WEKA',
    '10-fold-Cross-validation',
    'DEAP 데이터세트',
    '데이터 전처리',
    'Clean_Line',
    '시간-주파수 변환',
    '독립성분분석',
    '블라인드 신호 분리',
  ],
  graph: {
    '0': [1],
    '1': [2],
    '2': [3],
    '3': [4, 5],
    '4': [],
    '5': [6, 7, 8],
    '6': [],
    '7': [],
    '8': [9, 16],
    '9': [10, 11, 12, 13, 14, 39],
    '10': [],
    '11': [],
    '12': [],
    '13': [],
    '14': [],
    '39': [40],
    '16': [17, 24],
    '17': [18, 19, 20, 21, 22, 23],
    '18': [],
    '19': [],
    '20': [],
    '21': [],
    '22': [],
    '23': [],
    '24': [25, 26],
    '25': [],
    '26': [27, 33, 34, 35],
    '27': [28, 29, 30, 31, 32],
    '28': [],
    '29': [],
    '30': [],
    '31': [],
    '32': [],
    '33': [],
    '34': [],
    '35': [36],
    '36': [37, 38, 39],
    '37': [],
    '38': [],
    '40': [],
  } as unknown as Map<string, number[]>,
};

export function getDemoDocument(documentId: number): WBDocument {
  return { ...demoDocumentData, documentId: documentId, documentName: `demo${documentId}` };
}

const demoDocumentData: WBDocument = {
  documentId: -1,
  documentName: 'demo-1',
  dataType: 'pdf',
  createdAt: 0,
  modifiedAt: 0,
};

export const demoDocumentList: WBDocument[] = [
  demoDocumentData,
  {
    documentId: -2,
    documentName: 'demo-2',
    dataType: 'pdf',
    createdAt: 0,
    modifiedAt: 0,
  },
  {
    documentId: -3,
    documentName: 'demo-3',
    dataType: 'pdf',
    createdAt: 0,
    modifiedAt: 0,
  },
];
