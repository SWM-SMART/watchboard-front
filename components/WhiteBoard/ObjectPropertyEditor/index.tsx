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
      break;
    case 'CIRCLE':
      panels.push(
        <CirclePanel key={`property-panel-circle`} obj={obj as CircleObj} onChange={onChange} />,
      );
      break;
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
      <SelectProperty
        propKey={'overflow'}
        label="오버플로"
        propVal={obj.overflow}
        options={['normal', 'break-word']}
        onChange={onChange}
        span={2}
      />
      <SelectProperty
        propKey={'textAlign'}
        label="정렬"
        propVal={obj.textAlign}
        options={['center', 'left', 'right']}
        onChange={onChange}
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

interface CirclePanelProps {
  obj: CircleObj;
  onChange: (key: string, val: any) => void;
}

function CirclePanel({ obj, onChange }: CirclePanelProps) {
  return (
    <div className={styles.panel}>
      <Property propKey="r" propVal={obj.r.toString()} onChange={onChange} type="NUMBER" />
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
  return (
    <div className={styles.property} style={{ gridColumn: `span ${span}` }}>
      <p className={styles.label}>{label ? label : propKey}</p>
      <input
        className={styles.input}
        value={propVal}
        onChange={(e) => {
          if (!enabled) return e.preventDefault();
          if (onChange === undefined) return;
          onChange(propKey, getValue(e.target.value, type));
        }}
      />
    </div>
  );
}

interface SelectPropertyProps {
  propKey: string;
  label?: string;
  propVal: string;
  options: string[];
  onChange?: (key: string, val: any) => void;
  span?: number;
  enabled?: boolean;
}
function SelectProperty({
  propKey,
  label,
  propVal,
  options,
  onChange,
  span = 1,
  enabled = true,
}: SelectPropertyProps) {
  return (
    <div className={styles.property} style={{ gridColumn: `span ${span}` }}>
      <p className={styles.label}>{label ? label : propKey}</p>
      <select
        defaultValue={propVal}
        className={styles.select}
        onPointerDown={(e) => {
          if (!enabled) e.preventDefault();
        }}
        onChange={(e) => {
          if (onChange !== undefined) onChange(propKey, e.target.value);
        }}
      >
        {options.map((v) => (
          <option key={v}>{v}</option>
        ))}
      </select>
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
