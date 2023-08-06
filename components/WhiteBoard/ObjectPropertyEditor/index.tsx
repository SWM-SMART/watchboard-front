'use client';
import { useWhiteBoard } from '@/states/whiteboard';
import styles from './objectPropertyEditor.module.css';
import { ChangeEvent } from 'react';

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

  // save object properties in array
  const keys = Object.keys(obj);
  const values = Object.values(obj);

  return (
    <div className={styles.container}>
      {values.map((v, i) => {
        return (
          <ObjectProperty
            key={`objectviewer-${keys[i]}`}
            propKey={keys[i]}
            propValue={values[i]}
            onChange={(e) => {
              const newObj = { ...obj, [keys[i]]: getValue(e.target.value) };
              updateObj(newObj);
            }}
          />
        );
      })}
    </div>
  );
}

interface ObjectPropertyProps {
  propKey: string;
  propValue: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

function ObjectProperty({ propKey: key, propValue: value, onChange }: ObjectPropertyProps) {
  return (
    <div className={styles.row}>
      <span className={styles.label}>{key}</span>
      <input className={styles.input} onChange={onChange} value={value} />
    </div>
  );
}

function getValue(input: string) {
  const number = Number(input);
  if (isNaN(number)) return input;
  return number;
}
