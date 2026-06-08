import styles from '../styles/defaultButton.module.css';

export function DefaultButton({ children, onClick }) {
    return (
        <button className={styles.button} onClick={onClick}>
            {children}
        </button>
    )
}