import {TokenAction, BattleMapId, TokenState} from './Types';
import {GenericDispatch} from '../redux/Types';
import {handleResponse} from '../common/Tools';


interface Request extends TokenAction {
    map_set_uuid: string,
    battle_map_uuid: string,
}


export async function postTokenAction(battleMapId: BattleMapId, action: TokenAction, dispatch: GenericDispatch) {
    const body: Request = {...action,
        map_set_uuid: battleMapId.map_set_uuid,
        battle_map_uuid: battleMapId.uuid,
    };
    const response = await(
        fetch('/api/token/action', {
            method:'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(body),
        })
    )
    handleResponse(dispatch, response);
}

export async function getAllTokens(battleMapId: BattleMapId, dispatch: GenericDispatch): Promise<TokenState[]> {
    const url = '/api/token/all/' + battleMapId.map_set_uuid + '/' + battleMapId.uuid;
    const response = await(
        fetch(url, {
            method:'GET',

        })
    )
    if ( response.ok ) {
        return response.json()
    }
    handleResponse(dispatch, response);
    return []; // Never
}
