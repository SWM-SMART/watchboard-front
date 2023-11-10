import { useContextMenu } from '@/states/contextMenu';
import styles from './contextMenuViewer.module.css';
import { CSSProperties, useEffect } from 'react';

export default function ContextMenuViewer() {
  const { menu, setMenu } = useContextMenu((state) => ({
    menu: state.menu,
    setMenu: state.setMenu,
  }));

  useEffect(() => {
    if (menu === null) return;
    const pointerDown = () => setMenu(null);
    document.addEventListener('pointerdown', pointerDown);
    return () => document.removeEventListener('pointerdown', pointerDown);
  }, [menu, setMenu]);

  if (menu === null) return <></>;

  const style: CSSProperties = {};
  // check x overflow
  if (menu.position.x < window.innerWidth / 2) style.left = menu.position.x;
  else style.right = window.innerWidth - menu.position.x;
  // check y overflow
  if (menu.position.y < window.innerHeight / 2) style.top = menu.position.y;
  else style.bottom = window.innerHeight - menu.position.y;

  return (
    <ul className={styles.container} style={style}>
      {menu.items.map((v) => {
        return (
          <li className={styles.item} key={v.label} onPointerDown={v.onClick}>
            {v.label}
          </li>
        );
      })}
    </ul>
  );
}
