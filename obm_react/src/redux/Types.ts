import {Message} from './Messages'
import {MapSetList} from './MapSets'
import {CookieData} from './Cookies'
import {Mode} from './Mode'
import {SelectedMapSet} from './SelectedMapSet'

export interface RootState {
    messages: Message[],
    mapSetUpdateCount: number,
    cookies: CookieData,
    mode: Mode,
    selectedMapSet: SelectedMapSet,
}