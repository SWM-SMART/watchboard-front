import { ReactNode, useState } from 'react';
import styles from './tab.module.css';

interface TabProps {
  children: ReactNode[];
  labels: string[];
}

export default function Tab({ children, labels }: TabProps) {
  const { tabHeader, tabIndex } = useHeader(labels);
  return (
    <div className={styles.tabContainer}>
      <div className={styles.tabHeaderContainer}>{tabHeader}</div>
      <div key={`tab-${tabIndex}`} className={styles.tabContent}>
        {children[tabIndex]}
      </div>
    </div>
  );
}

function useHeader(labels: string[]) {
  const [tabIndex, setTabIndex] = useState<number>(0);
  const tabHeader = (
    <div className={styles.tabHeader}>
      {labels.map((label, index) => {
        return (
          <span
            onClick={() => setTabIndex(index)}
            key={`${index}.${index == tabIndex}`}
            className={`${styles.headerLabel} ${index === tabIndex ? styles.enabled : ''}`}
          >
            {label}
          </span>
        );
      })}
    </div>
  );

  return { tabHeader, tabIndex };
}
