export function highlightKeywordStr(input: string, keywords: Map<string, boolean>) {
  // highlights keywords
  const pos = getKeywordPos(input, keywords);

  // merge pos
  const mergedPos = mergePos(pos);

  // apply marks
  const str = applyMarks(input, mergedPos);

  return str;
}

export function getKeywordPos(input: string, keywords: Map<string, boolean>) {
  const pos: Pos[] = [];
  for (const [s, f] of keywords.entries()) {
    // find all occurences
    if (!f) continue;
    const matches = input.matchAll(new RegExp(s, 'gi'));
    for (const m of matches) {
      if (m.index === undefined) continue;
      pos.push({ start: m.index, end: m.index + s.length });
    }
  }
  return pos;
}

export interface Pos {
  start: number;
  end: number;
}

function posSorter(a: Pos, b: Pos) {
  // latter item comes first
  if (a.end > b.end) {
    return -1;
  } else if (a.end < b.end) {
    return 1;
  } else {
    return a.start > b.start ? -1 : 1;
  }
}

export function mergePos(pos: Pos[]): Pos[] {
  // apply occurences
  pos.sort(posSorter);
  const bounds: Pos = { start: -1, end: -1 };
  const res: Pos[] = [];
  for (const p of pos) {
    // first
    if (bounds.start === -1 || bounds.end === -1) {
      // update bounds
      bounds.end = p.end;
      bounds.start = p.start;
    } else if (p.end < bounds.start) {
      // mark
      res.push({ start: bounds.start, end: bounds.end });
      // update bounds
      bounds.end = p.end;
      bounds.start = p.start;
    } else {
      bounds.end = Math.max(bounds.end, p.end);
      bounds.start = Math.min(bounds.start, p.start);
    }
  }

  // apply last mark
  if (bounds.start !== -1 || bounds.end !== -1) {
    res.push({ start: bounds.start, end: bounds.end });
  }

  return res;
}

function applyMarks(sourceStr: string, pos: Pos[]): string {
  let str = sourceStr;
  // sort occurences
  // pos.sort(posSorter);

  for (const p of pos) {
    str =
      str.slice(0, p.start) + '<mark>' + str.slice(p.start, p.end) + '</mark>' + str.slice(p.end);
  }

  return str;
}
