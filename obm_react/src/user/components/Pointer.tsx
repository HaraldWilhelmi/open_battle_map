import CSS from "csstype";

interface Props {
    color: string,
    onClick?: (() => void),
    fades: boolean,
    onAnimationEnd?: (() => void)
}


function noop(): void {}


export function Pointer(props: Props) {
    const style: CSS.Properties = {
        pointerEvents: props.onClick ? 'all' : 'none',
    };
    const onClick = props.onClick ? props.onClick: noop;
    const gradientId = 'grad' + props.color;
    const className = props.fades ? 'laser-pointer-fading' : 'laser-pointer';
    const onAnimationEnd = props.onAnimationEnd ? props.onAnimationEnd : noop;

    return <svg
        width="40" height="40" xmlns="http://www.w3.org/2000/svg"
        className={className} onAnimationEnd={onAnimationEnd}
    >
        <defs>
            <radialGradient id={gradientId} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" stopColor={props.color} stopOpacity={1} />
                <stop offset="5%" stopColor={props.color} stopOpacity={0.9} />
                <stop offset="15%" stopColor={props.color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={props.color} stopOpacity={0} />
            </radialGradient>
        </defs>
        <circle cx="20" cy="20" r="20" fill={'url(#' + gradientId + ')'} style={style} onClick={onClick}/>
        <circle cx="20" cy="20" r="17" fill="none" stroke="White" strokeWidth="1" />
        <circle cx="20" cy="20" r="19" fill="none" stroke="Black" strokeWidth="1" />
        <circle cx="20" cy="20" r="18" fill="none" stroke={props.color} strokeWidth="1" />
    </svg>
}

export default Pointer;
