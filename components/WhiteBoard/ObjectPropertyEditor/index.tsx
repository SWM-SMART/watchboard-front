'use client';
import { useWhiteBoard } from '@/states/whiteboard';
import styles from './objectPropertyEditor.module.css';
import { ReactNode, useEffect, useState } from 'react';

interface ObjectPropertyEditorProps {
  targetObjId: string | null;
}

// view and edit target object properties
export default function ObjectPropertyEditor({ targetObjId }: ObjectPropertyEditorProps) {
  const { objMap, updateObj } = useWhiteBoard((state) => ({
    objMap: state.objMap,
    updateObj: state.updateObj,
  }));

  if (targetObjId === null) return <></>;

  // get object from objMap using targetObjId
  const obj = objMap.get(targetObjId);

  // show nothing if obj is not found or set
  if (obj === undefined) return <></>;

  // change handler
  const onChange = (key: string, val: any) => {
    updateObj({ ...obj, [key]: val } as Obj);
  };

  const panels: ReactNode[] = [
    <BasicPanel key={`property-panel-basic`} obj={obj} onChange={onChange} />,
  ];
  switch (obj.type) {
    case 'RECT':
      panels.push(
        <RectanglePanel key={`property-panel-rect`} obj={obj as RectObj} onChange={onChange} />,
      );
      break;
    case 'TEXT':
      panels.push(
        <TextPanel key={`property-panel-text`} obj={obj as TextObj} onChange={onChange} />,
      );
      break;
    case 'LINE':
      panels.push(
        <LinePanel key={`property-panel-line`} obj={obj as LineObj} onChange={onChange} />,
      );
    case 'ROOT':
  }

  return <div className={styles.container}>{panels}</div>;
}

type PropertyType = 'STRING' | 'NUMBER';

interface PanelProps {
  obj: Obj;
  onChange: (key: string, val: any) => void;
}

// panel for basic props
function BasicPanel({ obj, onChange }: PanelProps) {
  return (
    <div className={styles.panel}>
      <Property
        propKey={'id'}
        propVal={obj.objId.toString()}
        type="STRING"
        enabled={false}
        span={4}
      />
      <Property
        propKey={'x'}
        propVal={obj.x.toString()}
        onChange={onChange}
        type="NUMBER"
        span={2}
      />
      <Property
        propKey={'y'}
        propVal={obj.y.toString()}
        onChange={onChange}
        type="NUMBER"
        span={2}
      />
    </div>
  );
}

interface RectPanelProps {
  obj: RectObj;
  onChange: (key: string, val: any) => void;
}

// panel for rectangle-only props
function RectanglePanel({ obj, onChange }: RectPanelProps) {
  return (
    <div className={styles.panel}>
      <Property
        propKey={'w'}
        label="넓이"
        propVal={obj.w.toString()}
        onChange={onChange}
        type="NUMBER"
      />
      <Property
        propKey={'h'}
        label="높이"
        propVal={obj.h.toString()}
        onChange={onChange}
        type="NUMBER"
      />
      <Property
        propKey={'color'}
        label="색상"
        propVal={obj.color}
        onChange={onChange}
        type="STRING"
        span={2}
      />
    </div>
  );
}

interface TextPanelProps {
  obj: TextObj;
  onChange: (key: string, val: any) => void;
}

// panel for rectangle-only props
function TextPanel({ obj, onChange }: TextPanelProps) {
  return (
    <div className={styles.panel}>
      <Property
        propKey={'w'}
        label="넓이"
        propVal={obj.w.toString()}
        onChange={onChange}
        type="NUMBER"
        span={2}
      />
      <Property
        propKey={'fontSize'}
        label="폰트크기"
        propVal={obj.fontSize.toString()}
        onChange={onChange}
        type="NUMBER"
        span={2}
      />
      <Property
        propKey={'color'}
        label="색상"
        propVal={obj.color}
        onChange={onChange}
        type="STRING"
        span={2}
      />
      <Property
        propKey={'overflow'}
        label="오버플로"
        propVal={obj.overflow}
        onChange={onChange}
        enabled={false}
        type="STRING"
        span={2}
      />
      <Property
        propKey={'text'}
        label="내용"
        propVal={obj.text}
        onChange={onChange}
        type="STRING"
        span={4}
      />
    </div>
  );
}

interface LinePanelProps {
  obj: LineObj;
  onChange: (key: string, val: any) => void;
}

function LinePanel({ obj, onChange }: LinePanelProps) {
  return (
    <div className={styles.panel}>
      <Property propKey="x2" propVal={obj.x2.toString()} onChange={onChange} type="NUMBER" />
      <Property propKey="y2" propVal={obj.y2.toString()} onChange={onChange} type="NUMBER" />
      <Property
        propKey={'strokeWidth'}
        label="굵기"
        propVal={obj.strokeWidth.toString()}
        onChange={onChange}
        type="NUMBER"
      />
      <Property
        propKey={'color'}
        label="색상"
        propVal={obj.color}
        onChange={onChange}
        type="STRING"
        span={2}
      />
    </div>
  );
}

interface PropertyProps {
  propKey: string;
  label?: string;
  propVal: string;
  onChange?: (key: string, val: any) => void;
  type?: PropertyType;
  span?: number;
  enabled?: boolean;
}
function Property({
  propKey,
  label,
  propVal,
  onChange,
  type = 'STRING',
  span = 1,
  enabled = true,
}: PropertyProps) {
  const [val, setVal] = useState<string>(propVal);

  useEffect(() => {
    setVal(propVal);
  }, [propVal]);

  const onUpdate = () => {
    if (onChange === undefined) return;
    const newVal = getValue(val, type);
    setVal(newVal.toString());
    onChange(propKey, getValue(val, type));
  };

  return (
    <div className={styles.property} style={{ gridColumn: `span ${span}` }}>
      <p className={styles.label}>{label ? label : propKey}</p>
      <input
        className={styles.input}
        value={val}
        onChange={(e) => (enabled ? setVal(e.target.value) : e.preventDefault())}
        onKeyUp={(e) => {
          if (e.key === 'Enter') {
            onUpdate();
          }
        }}
        onBlur={() => onUpdate()}
      />
    </div>
  );
}

function getValue(input: string, type: PropertyType) {
  switch (type) {
    case 'STRING':
      return input;
    case 'NUMBER':
      const numberVal = Number(input);
      if (isNaN(numberVal)) return 0;
      return numberVal;
  }
}
