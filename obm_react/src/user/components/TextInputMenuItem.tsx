import {useState, useEffect} from 'react';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Form from 'react-bootstrap/Form';


interface Props {
    label: string,
    doIt: (value: string) => void,
    initialValue?: string,
    placeholder?: string,
    disabled?: boolean,
}


export function TextInputMenuItem(props: Props) {
    const [value, setValue] = useState('');

    useEffect(() => {
            let value = props.initialValue;
            setValue(value === undefined ? '' : value);
            return undefined;
        },
        [props.initialValue]
    );

    let onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
    };

    let onSubmit = (event: React.FormEvent) => {
        props.doIt(value);
        event.preventDefault();
        setValue(props.initialValue === undefined ? '' : props.initialValue);
    };

    return (
        <Form className="menu-item" onSubmit={onSubmit}>
            <InputGroup>
                <FormControl
                    value={value}
                    onChange={onChange}
                    placeholder={props.placeholder === undefined ? 'input' : props.placeholder}
                    disabled={props.disabled}
                    size="sm"
                />
                <InputGroup.Append>
                    <Button
                        type="submit"
                        className="menu-label"
                        variant="secondary"
                        disabled={props.disabled === true}
                        size="sm"
                    >
                        {props.label}
                    </Button>
                </InputGroup.Append>
            </InputGroup>
        </Form>
    );
}

export default TextInputMenuItem;