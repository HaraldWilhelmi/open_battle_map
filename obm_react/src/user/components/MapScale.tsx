import {useState, useEffect, FormEvent} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import Form from 'react-bootstrap/Form';
import RangeSlider from 'react-bootstrap-range-slider';
import {GenericDispatch, RootState} from '../../redux/Types';
import {getNextNiceScaleExample} from '../tools/Map';
import {actions} from "../../redux/Store";
import {BattleMap} from "../../api/Types";


const SLIDER_DISPLAY_SIZE = 190;  // Wild guess!!!


interface Props {
    disabled?: boolean,
}

export function MapScale(props: Props) {
    const dispatch: GenericDispatch = useDispatch();

    const [meters, setMeters] = useState('1.0');
    const [pixels, setPixels] = useState('100');
    const [sliderMax, setSliderMax] = useState(100);

    const mapProperties = useSelector(
        (state: RootState) => state.mapProperties
    );

    const battleMap = useSelector(
        (state: RootState) => state.battleMap
    );

    useEffect(
        () => {
            if ( battleMap === null ) {
                return undefined;
            }
            const mapPixelsOnSlider = SLIDER_DISPLAY_SIZE / mapProperties.totalZoomFactor;
            setSliderMax(mapPixelsOnSlider);
            const maxMetersOnSlider = mapPixelsOnSlider / battleMap.background_pixels_per_meter;
            const ruler = getNextNiceScaleExample(0.8 * maxMetersOnSlider);
            const metersToShow = ruler.total;
            setMeters(metersToShow.toFixed(Math.max(0, 1 - Math.log10(metersToShow))));
            setPixels((metersToShow * battleMap.background_pixels_per_meter).toFixed(0));
            return undefined;
        },
        [mapProperties, battleMap]
    );

    let onSubmit = (event: FormEvent) => {
        event.preventDefault();
        dispatch(actions.messages.reset());
        const pixelsPerMeter = parseFloat(pixels) / Math.max(parseFloat(meters), 0.000001);
        let changedMap: BattleMap = {...battleMap, background_pixels_per_meter: pixelsPerMeter};
        dispatch(actions.battleMap.update(changedMap));
    };

    return (
        <Form onSubmit={onSubmit}>
            <InputGroup size="sm" className="menu-item">
                <InputGroup.Prepend>
                    <InputGroup.Text>Scale:</InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl
                    value={pixels}
                    onChange={e => setPixels(e.target.value)}
                    disabled={props.disabled}
                />
                <InputGroup.Append>
                    <InputGroup.Text>pixels ...</InputGroup.Text>
                </InputGroup.Append>
            </InputGroup>
            <RangeSlider
                value={parseInt(pixels)}
                min={1}
                max={sliderMax}
                onChange={e => setPixels(e.target.value)}
                size="sm"
                tooltip="off"
                disabled={props.disabled}
                className="menu-item"
            />
            <InputGroup size="sm" className="menu-item">
                <InputGroup.Prepend>
                    <InputGroup.Text>... are</InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl
                    value={meters}
                    onChange={e => setMeters(e.target.value)}
                    disabled={props.disabled}
                />
                <InputGroup.Append>
                    <InputGroup.Text>m</InputGroup.Text>
                    <Button
                        type="submit"
                        className="menu-label"
                        variant="secondary"
                        disabled={props.disabled === true}
                    >
                        Set Scale
                    </Button>
                </InputGroup.Append>
            </InputGroup>
        </Form>
    );
}

export default MapScale;