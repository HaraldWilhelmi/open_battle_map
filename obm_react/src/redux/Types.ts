import {Message} from './Messages';
import {CookieData} from './Cookies';
import {Mode} from './Mode';
import {MapSet} from './SelectedMapSet';
import {BattleMap} from './SelectedBattleMap';

export interface RootState {
    messages: Message[],
    mapSetUpdateCount: number,
    cookies: CookieData,
    mode: Mode,
    selectedMapSet: MapSet,
    selectedBattleMap: BattleMap,
}