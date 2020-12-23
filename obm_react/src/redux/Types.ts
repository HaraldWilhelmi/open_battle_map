import {AnyAction} from 'redux';
import {ThunkDispatch} from 'redux-thunk';
import {AsyncThunk} from '@reduxjs/toolkit';
import {MapSet, BattleMap, MapSetList, Coordinate, TokenId} from '../api/Types';


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
    Error,
    Success,
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
    widthAvailable: number,
    heightAvailable: number,
    width: number,
    height: number,
    naturalWidth: number,
    naturalHeight: number,
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
    mousePosition?: Coordinate,
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
    tokenId: TokenId | null,
    tokenRotation: number,
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
}

export type GenericDispatch = ThunkDispatch<RootState, null, AnyAction>;

export enum ThunkRejectReasons {
    ObsoleteSync = 'Obsolete sync',
    NothingToSync = 'Nothing to sync',
    InconsistentUpdate = 'Inconsistent Update',
    InconsistentRemove = 'Inconsistent Remove',
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
