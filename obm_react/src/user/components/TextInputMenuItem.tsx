import {useState, useEffect} from 'react';


interface Props {
    label: string,
    doIt: (value: string) => void,
    initialValue?: string,
    placeholder?: string,
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
        <form className="menu-item" onSubmit={onSubmit}>
            <button type="submit" className="menu-label">{props.label}</button>
            <div className="menu-field">
                <input
                    className="menu-field"
                    onChange={onChange}
                    placeholder={props.placeholder === undefined ? 'input' : props.placeholder}
                    value={value}
                />
            </div>
        </form>
    );
}

export default TextInputMenuItem;