import { atom } from 'recoil';

export const objMapState = atom<Map<string, Obj>>({
  key: 'whiteboard-objMap',
  default: new Map<string, Obj>(),
});

export const objTreeState = atom<ObjNode>({
  key: 'whiteboard-objTree',
  default: {
    objId: 'root',
    childNodes: [],
  },
});

export const currentToolState = atom<Tool>({
  key: 'whiteboard-toolSelection',
  default: 'HAND',
});

export const currentObjState = atom<string | null>({
  key: 'whiteboard-objState',
  default: null,
});

export const dragState = atom<Coord | null>({ key: 'whiteboard-dragState', default: null });
