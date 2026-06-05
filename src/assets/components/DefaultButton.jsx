import styles from '../styles/DefaultButton.module.css';

export function DefaultButton(props) {
    return (
        <button className={styles.button}>{props.children}</button>
    )
}