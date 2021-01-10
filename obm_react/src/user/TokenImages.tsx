import {useEffect, useRef} from 'react';
import {useSelector} from 'react-redux';
import {RootState} from '../redux/Types';
import CSS from 'csstype';


export function TokenImages() {
    const divRef = useRef<HTMLDivElement>(null);

    const mapSet = useSelector(
        (state: RootState) => state.mapSet
    );

    useEffect(
        () => {
            const div = divRef.current;
            if ( !div ) return;

            const url = '/api/map_set/' + mapSet.uuid + '/tokens.html';
            let xhr = new XMLHttpRequest();
            xhr.responseType = 'document';
            xhr.open('get',url,true);
            xhr.onreadystatechange = function(){
                if ( xhr.readyState !== 4 ) return;
                let doc = xhr.responseXML?.documentElement;
                if ( doc ) {
                    const svg = document.importNode(doc,true);
                    while (div.lastChild) {
                        div.removeChild(div.lastChild);
                    }
                    div.appendChild(svg);
                } else {
                    console.log("Failed to load token images!")
                }
            };
            xhr.send();
        },
        [mapSet]
    );

    const style: CSS.Properties = {
        display: 'none',
    };

    return <div style={style} ref={divRef} />;
}

export default TokenImages;
