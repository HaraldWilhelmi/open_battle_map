import {MouseEvent, WheelEvent, useEffect, useState} from "react";
import CSS from 'csstype';
import {useSelector} from 'react-redux';
import {TokenId, MapSet, TokenType} from '../../api/Types';
import {RootState} from '../../redux/Types';
import {getTokenImageUrl, getTokenIdAsString, getTokenType} from '../tools/Token';
import {v4 as uuid} from 'uuid';


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

    const mapSet: MapSet = useSelector(
        (state: RootState) => state.mapSet
    );
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
    const alt = getTokenIdAsString(props.tokenId);
    const src = getTokenImageUrl(mapSet, props.tokenId);

    const rotatorStyle: CSS.Properties = {
        transform: 'rotate(' + props.rotation + 'rad)',
    };

    const pointerEvents = props.pointerEvents ?? true ? 'all' : 'none';

    const imageStyle: CSS.Properties = {
        left: 0,
        top: 0,
        width: props.width + 'px',
        height: 'auto',
        zIndex: 100,
        pointerEvents,
    };

    const markStyle: CSS.Properties = {
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 101,
        color: props.tokenId.mark_color,
        pointerEvents: 'none',
        fontSize: tokenType.mark_font_size,
    };

    const areas = tokenType.active_areas.map(
        (area) =>
            <area
                shape={area.shape}
                coords={area.coords.join(',')}
                onClick={props.onClick}
                onDragStart={props.onClick}
                onWheel={props.onWheel}
                alt="click me"
            />
    );

    return <div className="token-frame">
        <div style={rotatorStyle}>
            <img style={imageStyle} src={src} alt={alt} useMap={'#' + mapTag} />
            <map name={mapTag}>
                {areas}
            </map>
        </div>
        <div style={markStyle}>{props.tokenId.mark}</div>
    </div>;
}

export default Token;