import {Message} from './Messages'
import {MapSetList} from './MapSets'
import {CookieData} from './Cookies'
import {Mode} from './Mode'
import {SelectedMapSet} from './SelectedMapSet'

export interface RootState {
    messages: Message[],
    mapSets: MapSetList,
    cookies: CookieData,
    mode: Mode,
    selectedMapSet: SelectedMapSet,
}