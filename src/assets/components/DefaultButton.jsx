import styles from '../styles/defaultButton.module.css';

export function DefaultButton({ children, onClick, disabled = false, loading = false, type = 'submit' }) {
    return (
        <button
            className={styles.button}
            onClick={onClick}
            type={type}
            disabled={disabled || loading}
            aria-busy={loading}
        >
            {loading && <span className={styles.spinner} aria-hidden='true' />}
            <span>{children}</span>
        </button>
    )
}
