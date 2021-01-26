import {UnpackedResponse} from "./UnpackResponse";

export enum Operation {
    GET = 'fetch',
    PUT = 'create',
    POST = 'update',
    DELETE = 'delete',
}

export class MapSetNotFound extends Error {
    constructor() {
        super('Background Set not found!');
        Object.setPrototypeOf(this, MapSetNotFound.prototype);
    }
}

export class BattleMapNotFound extends Error {
    constructor() {
        super('Battle Background not found!');
        Object.setPrototypeOf(this, BattleMapNotFound.prototype);
    }
}

export class AdminSecretRequired extends Error {
    constructor() {
        super('Admin Secret required!');
        Object.setPrototypeOf(this, AdminSecretRequired.prototype);
    }
}


export interface MapSetId {
    uuid: string;
}


export interface MapSetUpdate extends MapSetId {
    name: string,
}

export interface MapSetCreate {
    name: string;
}

export interface BattleMapItem {
    uuid: string;
    name: string;
}

export interface MapSet extends MapSetUpdate, BattleMapCreate {
    battle_maps: BattleMapItem[];
    token_set: TokenSet;
}



export interface BattleMapId {
    uuid: string;
    map_set_uuid: string;
}

export interface BattleMapUpdate extends BattleMapId {
    name: string;
    background_pixels_per_meter: number;
}

export interface BattleMapCreate {
    name: string;
    map_set_uuid: string;
}

export interface BattleMap extends BattleMapUpdate, BattleMapCreate {
    revision: number;
    action_count: number;
}


export interface MapSetListItem {
    uuid: string,
    name: string,
}

export type MapSetList = MapSetListItem[];


export interface ColorCombo {
    color: string,
    mark_color: string,
}

export interface TokenId extends ColorCombo {
    token_type: number,
    mark: string,
}

export const NEW_TOKEN_MARK = '';

export interface Coordinate {
    x: number,
    y: number,
}

export interface TokenState extends TokenId {
    position: Coordinate,
    rotation: number,
}


export interface AllTokenStatesResponse {
    next_action_index: number,
    tokens: TokenState[],
}


export enum TokenActionType {
    added='added',
    removed='removed',
    moved='moved',
}

export interface TokenAction extends TokenState {
    action_type: TokenActionType,
    uuid: string,
}


export class TokenActionHistoryExpired extends Error {}


export interface PointerAction {
    position: Coordinate,
    color: string,
    uuid: string,
}

export interface PostPointerActionRequest extends PointerAction {
    map_set_uuid: string,
    battle_map_uuid: string,
}


export const OFF_MAP_POSITION: Coordinate = {
    x: -1,
    y: -1,
}


export interface ActionHistoryId extends BattleMapId {
    since: number,
}

export interface ActionHistory extends ActionHistoryId {
    last_action_index: number,
    battle_map_revision: number,
    token_actions: TokenAction[],
    pointer_actions: PointerAction[],
}


export interface TokenDescriptor {
    token_type: number,
    width_in_m: number,
    mark_font_size: string,
    width: number,
    height: number,
    color_combos: ColorCombo[],
}

export type TokenSet = TokenDescriptor[];



export interface GenericApiDescriptor {
    name: string,
    baseUrl: string,
}

export interface GenericApiWithoutIdDescriptor extends GenericApiDescriptor {
    detectSpecialErrors?: (response: UnpackedResponse, operation: Operation) => void,
}

export interface IdDescriptor<ID, ID_LIKE extends ID> {
    isIdOf: (id: ID, idLike: ID_LIKE) => boolean,
    getIdOf: (idLike: ID_LIKE) => ID,
    getFetchUri: (id: ID) => string,
    detectSpecialErrors?: (response: UnpackedResponse, operation: Operation, id: ID | undefined) => void,
}

export interface GenericApiWithIdDescriptor<ID, ID_LIKE extends  ID>
    extends GenericApiDescriptor, IdDescriptor<ID, ID_LIKE> {}

export interface GenericApiWithoutId extends GenericApiWithoutIdDescriptor {
    myCheckedUnpack: (response: Response, operation: Operation) => Promise<UnpackedResponse>,
}

export interface ReadonlyApi<DATA> extends GenericApiWithoutId {
    get: () => Promise<DATA>,
}

export interface WriteOnlyApi<CREATE> extends GenericApiWithoutId {
    create: (data: CREATE) => Promise<void>,
}

export interface ReadonlyApiWithId<ID, ID_LIKE extends ID, DATA extends ID_LIKE> extends GenericApiWithIdDescriptor<ID, ID_LIKE> {
    get: (id: ID) => Promise<DATA>,
    myCheckedUnpack: (response: Response, operation: Operation, id: ID|undefined) => any,
}

export interface UpdatableApiWithId<
    ID,
    UPDATE extends ID,
    CREATE,
    DATA extends UPDATE & CREATE
>
    extends ReadonlyApiWithId<ID, UPDATE, DATA>
{
    create: (data: CREATE) => Promise<DATA>,
    update: (data: UPDATE) => Promise<void>,
    remove: (id: ID) => Promise<void>,
}
