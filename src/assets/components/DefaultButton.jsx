import styles from '../styles/DefaultButton.module.css';

export function DefaultButton({ children, onClick }) {
    return (
        <button className={styles.button} onClick={onClick}>
            {children}
        </button>
    )
}