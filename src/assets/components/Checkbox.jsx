import styles from '../styles/checkbox.module.css';

export default function Checkbox({ checked = false, onChange, children }) {
  return (
    <label className={styles.label}>
      <input
        className={styles.checkbox}
        type="checkbox"
        checked={checked}
        onChange={onChange}
      />
      {children}
    </label>
  );
}
