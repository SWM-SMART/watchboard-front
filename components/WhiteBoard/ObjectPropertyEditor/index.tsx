'use client';
import styles from './objectPropertyEditor.module.css';
import { objMapState } from '@/states/whiteboard';
import { ChangeEvent, useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';

interface ObjectPropertyEditorProps {
  targetObjId: string | null;
}

// view and edit target object properties
export default function ObjectPropertyEditor({ targetObjId }: ObjectPropertyEditorProps) {
  const [objMap, setObjMap] = useRecoilState(objMapState);
  const [obj, setObj] = useState<Obj | undefined>(undefined);

  // get object from objMap using targetObjId
  useEffect(() => {
    if (targetObjId === null) return;
    setObj(objMap.get(targetObjId));
  }, [targetObjId, objMap]);

  // update objMap if obj value has changed
  useEffect(() => {
    if (obj === undefined) return;
    setObjMap((previousMap) => {
      return new Map([...previousMap, [obj.objId, obj]]);
    });
  }, [obj, setObjMap]);

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
              setObj((previousObj) => {
                if (previousObj === undefined) return undefined;
                return { ...previousObj, [keys[i]]: e.target.value };
              });
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