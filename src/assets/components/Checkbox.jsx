import { useState } from 'react';
import styles from '../styles/Checkbox.module.css';

export default function Checkbox(props) {
  const [isChecked, setIsChecked] = useState(false);

  return (
    <label className={styles.label}>
      <input
        className={styles.checkbox}
        type="checkbox"
        checked={isChecked}
        onChange={(e) => setIsChecked(e.target.checked)}
      />
      {props.children}
    </label>
  );
}