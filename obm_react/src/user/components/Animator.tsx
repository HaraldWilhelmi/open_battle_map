import {useEffect} from "react";
import CSS from 'csstype';
import {addKeyFrames, removeKeyFrames} from "../tools/DynamicAnimations";


function noop() {}


interface Props {
    children: JSX.Element[] | JSX.Element,
    id: string,
    animation: string,
    keyframes: string,
    onAnimationEnd?: (() => void),
}

export function Animator(props: Props) {
    useEffect(
        () => {
            addKeyFrames(props.id, props.keyframes);
            return () => removeKeyFrames(props.id)
        }
    );

    const endAnimation = props.onAnimationEnd ? props.onAnimationEnd : noop;

    const style: CSS.Properties = {
        pointerEvents: 'none',
        animation: props.id + ' ' + props.animation,
    };

    return <div style={style} onAnimationEnd={endAnimation}>
        {props.children}
    </div>;
}

export default Animator;