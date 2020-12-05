import {Message} from './Messages'
import {MapSetList} from './MapSets'
import {CookieData} from './Cookies'

export interface RootState {
    messages: Message[],
    mapSets: MapSetList,
    cookies: CookieData,
}