import {AnyAction} from 'redux';
import {ThunkDispatch} from 'redux-thunk';
import {AsyncThunk} from '@reduxjs/toolkit';
import {MapSet, BattleMap, MapSetList, Coordinate, TokenState, TokenSet, TokenActionHistory} from '../api/Types';


// I really would like to write:
//
//    export type Timer = ReturnType<typeof window.setTimeout>;
//
// However this gives in combination with Redux:
//
//    Property '[Symbol.toPrimitive]' is missing in type 'WritableDraft<Timeout>' but required in type 'Timeout'.  TS2345
//
export type Timer = any;


export enum MessageCategory {
    Error = 'ERROR',
    Success = 'INFO',
}

export interface Message {
    category: MessageCategory,
    content: string,
}

export enum CookieNames {
    obm_admin_secret = 'obm_admin_secret',
}

export interface CookieData {
    adminSecret?: string,
}

export enum Mode {
    Admin = 'Admin',
    AdminLogin = 'AdminLogin',
    User = 'User',
}

export interface MapProperties {
    naturalWidth: number,
    naturalHeight: number,
    widthAvailable: number,
    heightAvailable: number,
    zoomedWidth: number,
    zoomedHeight: number,
    visibleWidth: number,
    visibleHeight: number,
    xOffset: number,
    yOffset: number,
    userZoomFactor: number,
    totalZoomFactor: number,
    naturalToDisplayRatio: number,
}

export interface GeometryUpdate {
    widthAvailable: number,
    heightAvailable: number,
    naturalWidth: number,
    naturalHeight: number,
}

export interface MapMove {
    deltaX: number,
    deltaY: number,
}

export interface MapZoom {
    physicalFocusPoint?: Coordinate,
    zoomFactorRatio: number,
}

export enum MouseMode {
    Default,
    MoveToken,
    TurnToken,
    MoveMap,
}

export interface MouseState {
    mode: MouseMode,
    lastSeen: Coordinate | null,
    cursorStyle: string,
}

export interface MovingTokenState extends TokenState {
    toPosition: Coordinate,
    toRotation: number,
}

export interface Tokens {
    flyingToken: TokenState | null,
    flyingTokenIsNew: boolean,
    placedTokens: TokenState[],
    movingTokens: MovingTokenState[],
}

export interface SyncStateItem {
    isSyncing: boolean,
    isObsolete: boolean,
    timer: Timer,
}

export interface SyncState {
    [syncKey: string]: SyncStateItem,
}

export interface RootState {
    messages: Message[],
    cookies: CookieData,
    mode: Mode,
    syncer: SyncState,
    mapSet: MapSet,
    battleMap: BattleMap,
    mapProperties: MapProperties,
    mapSetList: MapSetList,
    mouse: MouseState,
    tokens: Tokens,
    defaultTokenSet: TokenSet,
    localTokenActionTrack: string[],
    tokenActionHistory: TokenActionHistory,
}

export type GenericDispatch = ThunkDispatch<RootState, null, AnyAction>;

export enum ThunkRejectReasons {
    ObsoleteSync = 'Obsolete sync',
    NothingToSync = 'Nothing to sync',
    InconsistentUpdate = 'Inconsistent Update',
    InconsistentRemove = 'Inconsistent Remove',
    ApiError = 'API Error',
}

export interface ThunkApi {
    state: RootState,
    dispatch: GenericDispatch,
    rejectValue: ThunkRejectReasons,
}

export interface SyncDescriptor<DATA> {
    syncKey: string,
    syncPeriodInMs: number,
    syncThunk: AsyncThunk<DATA, undefined, ThunkApi>,
}
