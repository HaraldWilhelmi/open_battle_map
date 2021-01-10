import {MouseEvent, WheelEvent, useEffect, useState} from "react";
import {useSelector} from 'react-redux';
import {TokenId} from '../../api/Types';
import {RootState} from '../../redux/Types';
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

    const mapSet = useSelector(
        (state: RootState) => state.mapSet
    );

    useEffect(() => {
        if ( mapTag === '' ) {
            setMapTag(uuid());
        }
        return undefined;
    }, [mapTag]);

    const tokenDescriptor = mapSet.token_set[props.tokenId.token_type];
    const scale = props.width / tokenDescriptor.width;
    const pointerEvents = props.pointerEvents ?? true ? 'visible' : 'none';

    const tokenStyle: CSS.Properties = {
        fill: props.tokenId.color,
    };

    const svg = <svg width={tokenDescriptor.width} height={tokenDescriptor.height} pointerEvents="None">
        <g
            pointerEvents={pointerEvents}
            onClick={props.onClick}
            onDragStart={props.onClick}
            onWheel={props.onWheel}
        >
            <use href={"#token" + tokenDescriptor.token_type} style={tokenStyle} />
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
        fontSize: tokenDescriptor.mark_font_size,
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
