import {MouseEvent, WheelEvent, useEffect, useState} from "react";
import {useSelector} from 'react-redux';
import {TokenId, TokenType} from '../../api/Types';
import {RootState} from '../../redux/Types';
import {getTokenType} from '../tools/Token';
import {v4 as uuid} from 'uuid';
import CSS from 'csstype';
import './Token.css'


interface Props {
    tokenId: TokenId,
    width: number,
    rotation: number,
    onClick: (event: MouseEvent) => void,
    onWheel: (event: WheelEvent) => void,
    pointerEvents?: boolean,
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

    const rotatorStyle: CSS.Properties = {
        transform: "scale(" + scale + ") rotate(" + props.rotation + "rad)",
        pointerEvents: 'none',
    };

    const markStyle: CSS.Properties = {
        transform: 'translate(-50%, -50%) scale(' + scale + ')',
        position: 'absolute',
        left: '50%',
        top: '50%',
        zIndex: 101,
        color: props.tokenId.mark_color,
        pointerEvents: 'none',
        fontSize: tokenType.mark_font_size,
        fontFamily: 'sans-serif',
    };

    return <div className="token-frame">
        <div style={rotatorStyle}>
            {svg}
        </div>
        <div style={markStyle}>
            {props.tokenId.mark}
        </div>
    </div>;
}

export default Token;
