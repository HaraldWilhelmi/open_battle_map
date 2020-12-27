
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
}



export interface BattleMapId {
    uuid: string;
    map_set_uuid: string;
}

export interface BattleMapUpdate extends BattleMapId {
    name: string;
}

export interface BattleMapCreate {
    name: string;
    map_set_uuid: string;
}

export interface BattleMap extends BattleMapUpdate, BattleMapCreate {
    revision: number;
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


export enum ActiveAreaShape {
    rect= 'rect',
    circle= 'circle',
}

export interface ActiveArea {
    shape: ActiveAreaShape,
    coords: number[],
}

export interface TokenType {
    token_type: number,
    width_in_m: number,
    mark_font_size: string,
    active_areas: ActiveArea[],
    color_combos: ColorCombo[],
}

export type TokenSet = TokenType[];

export interface ReadonlyApiDescriptor {
    name: string,
    baseUrl: string,
    detectSpecialErrors?: (response: Response, operation: Operation) => void,
}

export interface ReadonlyApi<DATA> extends ReadonlyApiDescriptor {
    get: () => Promise<DATA>,
}

export interface UpdatableApiWithIdDescriptor<ID> {
    name: string,
    baseUrl: string,
    isIdOf: (id: ID, idLike: ID) => boolean,
    getIdOf: (idLike: ID) => ID,
    getFetchUri: (id: ID) => string,
    detectSpecialErrors?: (response: Response, operation: Operation, id: ID|undefined) => void,
}


export interface UpdatableApiWithId<
    ID,
    UPDATE extends ID,
    CREATE,
    DATA extends ID & UPDATE & CREATE
>
    extends UpdatableApiWithIdDescriptor<ID>
{
    get: (id: ID) => Promise<DATA>,
    create: (data: CREATE) => Promise<DATA>,
    update: (data: UPDATE) => Promise<void>,
    remove: (id: ID) => Promise<void>,
}
