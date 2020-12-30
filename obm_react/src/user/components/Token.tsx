import {MouseEvent, WheelEvent, useEffect, useState} from "react";
import styled, {FlattenSimpleInterpolation} from 'styled-components';
import {useSelector} from 'react-redux';
import {TokenId, TokenType} from '../../api/Types';
import {RootState} from '../../redux/Types';
import {getTokenType} from '../tools/Token';
import {v4 as uuid} from 'uuid';
import './Token.css'


interface RotatorProps {
    readonly scale: number;
    readonly rotation: number;
}

const Rotator = styled.div<RotatorProps>`
    transform: scale(${props => props.scale}) rotate(${props => props.rotation}rad);
    pointerEvents: none;
`;

interface AnimatedRotatorProps extends RotatorProps{
    readonly animation: FlattenSimpleInterpolation;
}

const AnimatedRotator = styled.div<AnimatedRotatorProps>`
    transform: scale(${props => props.scale}) rotate(${props => props.rotation}rad);
    pointerEvents: none;
    animation: ${props => props.animation}
`;

interface MarkProps {
    readonly scale: number;
    readonly color: string;
    readonly size: string;
}

const Mark = styled.div<MarkProps>`
    transform: translate(-50%, -50%) scale(${props => props.scale});
    position: absolute;
    left: 50%;
    top: 50%;
    z-index: 101;
    color: ${props => props.color};
    pointer-events: none;
    font-size: ${props => props.size};
    font-family: sans-serif;
`;

interface Props {
    tokenId: TokenId,
    width: number,
    rotation: number,
    onClick: (event: MouseEvent) => void,
    onWheel: (event: WheelEvent) => void,
    pointerEvents?: boolean,
    animation?: FlattenSimpleInterpolation,
}

export function Token(props: Props) {
    const [mapTag, setMapTag]= useState('');

    const defaultTokenSet: TokenType[] = useSelector(
        (state: RootState) => state.defaultTokenSet
    );

    useEffect(() => {
        if ( mapTag === '' ) {
            setMapTag(uuid());
        }
        return undefined;
    }, [mapTag]);

    const tokenType = getTokenType(defaultTokenSet, props.tokenId);
    const scale = props.width / tokenType.width;
    const pointerEvents = props.pointerEvents ?? true ? 'visible' : 'none';

    const svg = <svg width="89" height="89" pointerEvents="None">
        <g
            pointerEvents={pointerEvents}
            onClick={props.onClick}
            onDragStart={props.onClick}
            onWheel={props.onWheel}
        >
            <polygon points="10,23 45,3 80,23" className="background"/>
            <circle cx="45" cy="45" r="35" className="background"/>
            <circle cx="45" cy="45" r="30" fill={props.tokenId.color}/>

            <line x1="17" y1="21" x2="45" y2="6" className="outline"/>
            <line x1="73" y1="21" x2="45" y2="6" className="outline"/>
            <line x1="39" y1="12" x2="45" y2="9" className="outline"/>
            <line x1="51" y1="12" x2="45" y2="9" className="outline"/>
        </g>
    </svg>;

    const mark = <Mark scale={scale} color={props.tokenId.mark_color} size={tokenType.mark_font_size}>
            {props.tokenId.mark}
    </Mark>;

    let image;
    if ( props.animation === undefined ) {
        image = <Rotator rotation={props.rotation} scale={scale}>
            {svg}
        </Rotator>
    } else {
        image = <AnimatedRotator rotation={props.rotation} scale={scale} animation={props.animation}>
            {svg}
        </AnimatedRotator>
    }

    return <div className="token-frame">{image}{mark}</div>;
}

export default Token;