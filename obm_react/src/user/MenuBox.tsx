import {useSelector} from 'react-redux';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import {RootState} from '../redux/Types';
import BattleMapSelector from './BattleMapSelector';
import Work from './Work';
import Play from './Play';

export function MenuBox() {
    let mapSet = useSelector(
        (state: RootState) => state.mapSet
    );

    return (
        <div className="menu-box">
            <div className="section">
                <div className="menu-item"><h3>{mapSet.name}</h3></div>
                <BattleMapSelector />
            </div>
            <div className="section">
                <Tabs defaultActiveKey="play">
                    <Tab eventKey="play" title="Play">
                        <Play />
                    </Tab>
                    <Tab eventKey="work" title="Work">
                        <Work />
                    </Tab>
                </Tabs>
            </div>
        </div>
    );
}

export default MenuBox;