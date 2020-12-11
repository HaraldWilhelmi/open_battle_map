import Button from 'react-bootstrap/Button'

interface Props {
    label: string,
    doIt: () => void,
    disabled?: boolean,
}

export function ClickMenuItem(props: Props) {
    return (
        <Button
            onClick={props.doIt}
            className="menu-item"
            variant="secondary"
            disabled={props.disabled === true}
            size="sm"
        >
            {props.label}
        </Button>
    );
}

export default ClickMenuItem;
