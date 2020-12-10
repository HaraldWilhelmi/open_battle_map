interface Props {
    label: string,
    doIt: () => void,
}

export function ClickMenuItem(props: Props) {
    return (
        <button onClick={props.doIt} className="menu-item">{props.label}</button>
    );
}

export default ClickMenuItem;
