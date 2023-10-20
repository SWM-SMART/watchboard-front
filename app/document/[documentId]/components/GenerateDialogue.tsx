'use client';

import Dialogue from '@/components/Dialogue';
import TextInput from '@/components/Dialogue/Input/TextInput';
import MouseHandler from '@/components/WhiteBoard/MouseHandler';
import NodeRenderer from '@/components/WhiteBoard/NodeRenderer';
import { useToast } from '@/states/toast';
import { useWhiteBoard } from '@/states/whiteboard';
import { generateGraph } from '@/utils/api';
import {
  createForceBundleFromMindmap,
  createTreeFromMindmap,
  objNodeSorter,
} from '@/utils/whiteboardHelper';
import { Canvas } from '@react-three/fiber';
import { Suspense, useEffect, useState } from 'react';

interface GenerateDialogueProps {
  onCancel: () => void;
}

type ScreenState = 'load' | 'preview' | 'input';
type PreviewMode = 'tree' | 'force';

export default function GenerateDialouge({ onCancel }: GenerateDialogueProps) {
  const [text, setText] = useState<string>('');
  const [state, setState] = useState<ScreenState>('input');
  const [rawGraphData, setRawGraphData] = useState<ThreeGraphData | null>(null);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('tree');
  const [previewBundle, setPreviewBundle] = useState<ObjBundle | null>(null);
  const [previewTree, setPreviewTree] = useState<ObjNode | null>(null);
  const { setCurrentTool, setBundle, addObj, removeObj } = useWhiteBoard((state) => ({
    setCurrentTool: state.setCurrentTool,
    setBundle: state.setBundle,
    addObj: state.addObj,
    removeObj: state.removeObj,
  }));
  const pushToast = useToast((state) => state.pushToast);

  const onGenerate = () => {
    setState('load');
    // request generation
    (async () => {
      const res = await generateGraph({ text });
      if (res === undefined) {
        pushToast({
          id: new Date().getTime(),
          duraton: 3000,
          msg: '작업을 실패했습니다.',
        });
        return setState('input');
      }

      setRawGraphData(res);
      setState('preview');
    })();
  };

  useEffect(() => {
    // generate bundle
    if (rawGraphData === null) return;
    setPreviewBundle(() => {
      switch (previewMode) {
        case 'tree':
          return createTreeFromMindmap(rawGraphData);
        case 'force':
          return createForceBundleFromMindmap(rawGraphData);
      }
    });
  }, [previewMode, rawGraphData]);

  useEffect(() => {
    if (previewBundle === null) return;
    // prepare preview
    const children: ObjNode[] = [];
    for (const obj of previewBundle.objs) {
      addObj(obj, false);
      children.push({
        objId: obj.objId,
        childNodes: [],
        depth: obj.depth,
      });
    }
    setPreviewTree({ objId: 'ROOT', depth: 0, childNodes: children.sort(objNodeSorter) });
    return () => {
      // cleanup
      for (const obj of previewBundle.objs) {
        removeObj(obj, false);
        setPreviewTree(null);
      }
    };
  }, [addObj, previewBundle, removeObj]);

  const onSubmit = () => {
    // set bundle and exit
    if (previewBundle === null) return;
    setState('load');
    (async () => {
      setBundle(previewBundle);
      setCurrentTool('BUNDLE');
      pushToast({
        id: new Date().getTime(),
        duraton: 5000,
        msg: '그래프 생성이 완료되었습니다!\n클릭해서 원하는 위치에 붙여넣어 주세요',
      });
      cleanUp();
      onCancel();
    })();
  };

  const cleanUp = () => {
    if (previewBundle === null) return;
    // remove previewBundle objs from objmap
    for (const obj of previewBundle.objs) {
      removeObj(obj);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '600px' }}>
      {(() => {
        switch (state) {
          case 'load':
            return (
              <Dialogue
                title={'그래프 생성'}
                onCancel={onCancel}
                onSubmit={onGenerate}
                enabled={false}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '20px',
                  }}
                >
                  <p>잠시만 기다려 주세요</p>
                  <div className="loading-bar"></div>
                </div>
              </Dialogue>
            );
          case 'preview':
            if (previewTree === null) return null;
            return (
              <Dialogue
                title={'그래프 생성 - 미리보기'}
                onCancel={() => {
                  cleanUp();
                  onCancel();
                }}
                onSubmit={onSubmit}
                enabled={true}
              >
                <p>렌더러</p>
                <select onChange={(e) => setPreviewMode(e.target.value as PreviewMode)}>
                  <option value={'tree'}>트리</option>
                  <option value={'force'}>마인드맵</option>
                </select>
                <Suspense>
                  <PreviewRenderer root={previewTree} />
                </Suspense>
              </Dialogue>
            );
          case 'input':
            return (
              <Dialogue
                title={'그래프 생성'}
                onCancel={onCancel}
                onSubmit={onGenerate}
                enabled={true}
              >
                <TextInput
                  text={text}
                  onChange={(e) => setText(e.target.value)}
                  label={'생성에 사용될 글'}
                  multiline={true}
                />
              </Dialogue>
            );
        }
      })()}
    </div>
  );
}

function PreviewRenderer({ root }: { root: ObjNode }) {
  return (
    <Canvas
      flat
      frameloop="demand"
      style={{ width: '100%', height: '300px' }}
      camera={{ position: [0, 0, 100], zoom: 1 }}
      orthographic
    >
      <ambientLight />
      <NodeRenderer node={root} />
      <MouseHandler forceTool="HAND" />
    </Canvas>
  );
}
