//
// This component is slightly magical:
//
// 1. The ugly <input type="file"> button is hidden behind it's label.
//    This is done by a strange hack including a CSS rule:
//
//           input[type="file"] { display: none; }
//
//    There is a lot of discussion on the net that hiding this
//    element is prevented by browsers for security reasons.
//    But this seems to work. Beside that the label is styled like
//    Bootstrap button.
//
// 2. Usually a <input type="file"> needs two user actions:
//      A) Select the file (-> onChange event)
//      B) Press the 'Upload' button
//    This component needs only A). That can only work if the
//    'value' of <input type="file"> is reset after each use.
//    Otherwise you could not retry a failed upload or re-upload a
//    changed file without changing the file name (no change - no
//    onChange event ...).
//

interface Props {
    label: string,
    accept: string,
    doIt: (file: File) => void,
    disabled?: boolean,
}

export function UploadMenuItem(props: Props) {
    let onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if ( event?.target?.files?.[0] ) {
            let file = event.target.files[0];
            props.doIt(file);
            event.target.form?.reset();
        }
    };

    return (
        <form>
            <label className="menu-item btn btn-sm btn-secondary">
                {props.label}
                <input type="file"
                    name={props.label}
                    onChange={onChange}
                    accept={props.accept}
                    disabled={props.disabled}
                />
            </label>
        </form>
    );
}

export default UploadMenuItem;
