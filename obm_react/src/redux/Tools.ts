import {AnyAction, Reducer} from 'redux';
import {AsyncThunk, createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Operation, ReadonlyApi, ReadonlyApiWithId, UpdatableApiWithId, WriteOnlyApi} from '../api/Types';
import {GenericDispatch, RootState, SyncDescriptor, ThunkApi, ThunkRejectReasons, SyncFinisher} from './Types';
import {syncerActions} from './reducers/Syncer';
import {messagesActions} from './reducers/Messages';
import {ApiError} from "../api/UnpackResponse";
import {internalError} from "../common/Tools";
import {reportApiProblem} from "../common/ApiLogs";

export interface GenericSyncDescriptor<DATA> {
    name: string,
    getMyOwnState: (state: RootState) => DATA | null,
    syncPeriodInMs: number,
}

export interface GenericSyncDescriptorWithoutId<DATA> extends GenericSyncDescriptor<DATA>{
    errorHandler?: (
        error: Error,
        operation: Operation,
        dispatch: GenericDispatch
    ) => void,
}

export interface ReadonlySyncDescriptor<DATA> extends GenericSyncDescriptorWithoutId<DATA> {
    api: ReadonlyApi<DATA>,
}

export interface GenericSyncSetupActions {
    invalidate: () => AnyAction,
    startSync: AsyncThunk<void, undefined, ThunkApi>,
    stopSync: AsyncThunk<void, undefined, ThunkApi>,
}

interface ReadonlySyncSetupActions<DATA> extends GenericSyncSetupActions {
    get: AsyncThunk<DATA, undefined, ThunkApi>,
}

interface ReadonlySyncSetup<DATA> {
    reducer: Reducer<DATA|null>,
    actions: ReadonlySyncSetupActions<DATA>,
}


export function createReadonlySyncReducer<DATA>(
    descriptor: ReadonlySyncDescriptor<DATA>
): ReadonlySyncSetup<DATA> {
    const name = descriptor.name;
    const handleError = getErrorHandlerWithoutId(descriptor);

    const get = createAsyncThunk<DATA, undefined, ThunkApi>(
        name + '/get',
        async (_: undefined, thunkApi) => {
            const dispatch = thunkApi.dispatch;
            const rejectWithValue = thunkApi.rejectWithValue;

            try {
                return await descriptor.api.get();
            }
            catch(error) {
                return rejectWithValue(handleError(error as Error, Operation.GET, dispatch));
            }
            finally {
                dispatch(syncerActions.obsoleteSync(name));
            }
        }
    );

    // Please note: Temporary failures during background sync are ignored.
    const sync = createAsyncThunk<DATA, SyncFinisher, ThunkApi>(
        name + '/sync',
        async (finishSync, thunkApi) => {
            const dispatch = thunkApi.dispatch;
            const rejectWithValue = thunkApi.rejectWithValue;
            let upToDate;
            let data: DATA | null = null;
            try {
                data = await descriptor.api.get();
            }
            catch (error) {
                return rejectWithValue(handleError(error as Error, Operation.GET, dispatch));
            }
            finally {
                upToDate = finishSync();
            }
            if ( upToDate ) {
                return data;
            } else {
                return rejectWithValue(ThunkRejectReasons.ObsoleteSync);
            }
        }
    );

    const slice = createSlice({
        name,
        initialState: null as DATA | null,
        reducers: {
            invalidate: () => null,
        },
        extraReducers: builder => {
            builder.addCase(get.fulfilled, (state, action) => action.payload)
            builder.addCase(sync.fulfilled, (state, action) => action.payload)
            builder.addCase(get.rejected, () => null)
        },
    });

    const startSync = getStartSyncThunk(descriptor, sync);
    const stopSync = getStopSyncThunk(descriptor);

    return {
        reducer: slice.reducer,
        actions: {...slice.actions,
            get, startSync, stopSync
        },
    }
}


function getErrorHandlerWithoutId<DATA>(descriptor: GenericSyncDescriptorWithoutId<DATA>):
    (error: Error, operation: Operation, dispatch: GenericDispatch) => ThunkRejectReasons
{
    return (error: Error, operation: Operation, dispatch: GenericDispatch) => {
        const handler = descriptor.errorHandler;
        if ( handler !== undefined ) {
            handler(error, operation, dispatch);
        }
        return handleGenericError(error, dispatch);
    }
}

function handleGenericError(error: Error, dispatch: GenericDispatch): ThunkRejectReasons {
    if ( error instanceof ApiError ) {
        dispatch(messagesActions.reportError(error.message));
        return ThunkRejectReasons.ApiError;
    }
    reportApiProblem();
    internalError(error.toString());
}

function getStartSyncThunk<DATA>(
    descriptor: GenericSyncDescriptor<DATA>,
    syncThunk: AsyncThunk<DATA, SyncFinisher, ThunkApi>,
):
    AsyncThunk<void, undefined, ThunkApi>
{
    const name = descriptor.name;
    const syncDescriptor: SyncDescriptor<DATA> = {
        syncKey: name,
        syncPeriodInMs: descriptor.syncPeriodInMs,
        syncThunk,
    }

    return createAsyncThunk(
        name + '/startSync',
        (_: undefined, thunkApi) => {
            const dispatch = thunkApi.dispatch;
            dispatch(syncerActions.add(syncDescriptor));
        }
    );
}

function getStopSyncThunk<DATA>(descriptor: GenericSyncDescriptor<DATA>):
    AsyncThunk<void, undefined, ThunkApi>
{
    const name = descriptor.name;
    return createAsyncThunk<void, undefined, ThunkApi>(
        name + '/stopSync',
        (_: undefined, thunkApi) => {
            const dispatch = thunkApi.dispatch;
            dispatch(syncerActions.remove(name));
        }
    );
}


export interface ReadonlySyncWithIdDescriptor<
    ID,
    ID_LIKE extends ID,
    DATA extends ID_LIKE
> extends GenericSyncDescriptor<DATA> {
    api: ReadonlyApiWithId<ID, ID_LIKE, DATA>,
    errorHandler?: (
        error: Error, operation: Operation, id: ID|undefined,
        dispatch: GenericDispatch
    ) => void,
}

export interface ReadonlySyncWithIdSetupActions<
    ID, DATA extends ID
> extends GenericSyncSetupActions {
    get: AsyncThunk<DATA, ID, ThunkApi>,
}

export interface ReadonlySyncWithIdSetup<
    ID, DATA extends ID
> {
    reducer: Reducer<DATA|null>,
    actions: ReadonlySyncWithIdSetupActions<ID, DATA>,
}


interface SyncWithIdHelper<ID, DATA extends ID> {
    handleError(error: Error, operation: Operation, id: ID|undefined, dispatch: GenericDispatch): ThunkRejectReasons,
    getIdOfLoadedData(state: RootState): ID | undefined,
    get: AsyncThunk<DATA, ID, ThunkApi>,
    sync: AsyncThunk<DATA, SyncFinisher, ThunkApi>,
    startSync: AsyncThunk<void, undefined, ThunkApi>,
    stopSync: AsyncThunk<void, undefined, ThunkApi>,
}


function createSyncWithIdHelper<ID, ID_LIKE extends ID, DATA extends ID_LIKE>(
    descriptor: ReadonlySyncWithIdDescriptor<ID, ID_LIKE, DATA>
): SyncWithIdHelper<ID, DATA> {
    const name = descriptor.name;

    function handleError(
        error: Error, operation: Operation, id: ID|undefined, dispatch: GenericDispatch
    ): ThunkRejectReasons {
        const handler = descriptor.errorHandler;
        if ( handler !== undefined ) {
            handler(error, operation, id, dispatch);
        }
        return handleGenericError(error, dispatch);
    }

    const get = createAsyncThunk<DATA, ID, ThunkApi>(
        name + '/get',
        async (id: ID, thunkApi) => {
            const dispatch = thunkApi.dispatch;
            const rejectWithValue = thunkApi.rejectWithValue;
            try {
                return await descriptor.api.get(id);
            }
            catch(error) {
                return rejectWithValue(handleError(error as Error, Operation.GET, id, dispatch));
            }
            finally {
                dispatch(syncerActions.obsoleteSync(name));
            }
        }
    );

    const sync = createAsyncThunk<DATA, SyncFinisher, ThunkApi>(
        name + '/sync',
        async (finishSync, thunkApi) => {
            const dispatch = thunkApi.dispatch;
            const getState = thunkApi.getState;
            const rejectWithValue = thunkApi.rejectWithValue;

            const stateBefore = getState();
            const id = getIdOfLoadedData(stateBefore);
            let data: DATA | null = null;
            let upToDate;

            try {
                if ( id === undefined ) {
                    return rejectWithValue(ThunkRejectReasons.NothingToSync);
                }
                data = await descriptor.api.get(id);
            }
            catch (error) {
                return rejectWithValue(handleError(error as Error, Operation.GET, id, dispatch));
            }
            finally {
                upToDate = finishSync();
            }
            if ( upToDate ) {
                return data;
            } else {
                return rejectWithValue(ThunkRejectReasons.ObsoleteSync);
            }
        }
    );

    function getIdOfLoadedData(state: RootState): ID | undefined {
        const data= descriptor.getMyOwnState(state);
        if ( data === null ) {
            return undefined;
        } else {
            return descriptor.api.getIdOf(data);
        }
    }

    const startSync = getStartSyncThunk(descriptor, sync);
    const stopSync = getStopSyncThunk(descriptor);

    return {handleError, getIdOfLoadedData, get, sync, startSync, stopSync};
}


export function createReadonlySyncWithIdReducer<ID, DATA extends ID>(
    descriptor: ReadonlySyncWithIdDescriptor<ID, DATA, DATA>
): ReadonlySyncWithIdSetup<ID, DATA> {
    const name = descriptor.name;

    const helper = createSyncWithIdHelper(descriptor);
    const get = helper.get;
    const sync = helper.sync;

    const slice = createSlice({
        name,
        initialState: null as DATA | null,
        reducers: {invalidate: () => null},
        extraReducers: builder => {
            builder.addCase(get.fulfilled, (state, action) => action.payload)
            builder.addCase(sync.fulfilled, (state, action) => action.payload)
            builder.addCase(get.rejected, () => null)
        },
    });

    return {
        reducer: slice.reducer,
        actions: {...slice.actions, ...helper},
    }
}


export interface UpdatableSyncWithIdDescriptor<
    ID,
    UPDATE extends ID,
    CREATE,
    DATA extends ID & UPDATE & CREATE
> extends GenericSyncDescriptor<DATA> {
    api: UpdatableApiWithId<ID, UPDATE, CREATE, DATA>,
    errorHandler?: (
        error: Error, operation: Operation, id: ID|undefined,
        dispatch: GenericDispatch
    ) => void,
}

export interface UpdatableSyncWithIdSetupActions<
    ID, CREATE, DATA extends ID & CREATE
> extends ReadonlySyncWithIdSetupActions<ID, DATA> {
    create: AsyncThunk<DATA, CREATE, ThunkApi>,
    update: AsyncThunk<DATA, DATA, ThunkApi>,
    remove: AsyncThunk<ID, ID, ThunkApi>,
}

export interface UpdatableSyncWithIdSetup<
    ID, CREATE, DATA extends ID & CREATE
> {
    reducer: Reducer<DATA|null>,
    actions: UpdatableSyncWithIdSetupActions<ID, CREATE, DATA>,
}


export function createUpdatableSyncWithIdReducer<
    ID,
    UPDATE extends ID,
    CREATE,
    DATA extends ID & UPDATE & CREATE
>(
    descriptor: UpdatableSyncWithIdDescriptor<ID, UPDATE, CREATE, DATA>
): UpdatableSyncWithIdSetup<ID, CREATE, DATA> {
    const name = descriptor.name;
    const isIdOf = descriptor.api.isIdOf;

    const helper = createSyncWithIdHelper(descriptor);
    const get = helper.get;
    const sync = helper.sync;
    const handleError = helper.handleError;
    const getIdOfLoadedData = helper.getIdOfLoadedData;

    const create = createAsyncThunk<DATA, CREATE, ThunkApi>(
        name + '/create',
        async (create: CREATE, thunkApi) => {
            const dispatch = thunkApi.dispatch;
            const rejectWithValue = thunkApi.rejectWithValue;
            try {
                const data = await descriptor.api.create(create);
                dispatch(syncerActions.obsoleteSync(name));
                return data;
            } catch(error) {
                return rejectWithValue(handleError(error as Error, Operation.PUT, undefined, dispatch));
            }
        }
    );

    const update = createAsyncThunk<DATA, DATA, ThunkApi>(
        name + '/update',
        async (data: DATA, thunkApi) => {
            const dispatch = thunkApi.dispatch;
            const getState = thunkApi.getState;
            const rejectWithValue = thunkApi.rejectWithValue;

            try {
                const state = getState();
                const id = getIdOfLoadedData(state);
                if ( id === undefined || ! isIdOf(id, data) ) {
                    return rejectWithValue(ThunkRejectReasons.InconsistentUpdate);
                }
                await descriptor.api.update(data);
                dispatch(syncerActions.obsoleteSync(name));
                return data;
            } catch(error) {
                const id = descriptor.api.getIdOf(data);
                return rejectWithValue(handleError(error as Error, Operation.POST, id, dispatch));
            }
        }
    );

    const remove = createAsyncThunk<ID, ID, ThunkApi>(
        name + '/remove',
        async (id: ID, thunkApi) => {
            const dispatch = thunkApi.dispatch;
            const getState = thunkApi.getState;
            const rejectWithValue = thunkApi.rejectWithValue;

            const data = descriptor.getMyOwnState(getState());
            if ( data === null || ! isIdOf(id, data) ) {
                return rejectWithValue(ThunkRejectReasons.InconsistentRemove);
            }
            try {
                await descriptor.api.remove(id);
                return id;
            } catch(error) {
                return rejectWithValue(handleError(error as Error, Operation.DELETE, id, dispatch));
            }
        }
    );

    const slice = createSlice({
        name,
        initialState: null as DATA | null,
        reducers: {invalidate: () => null},
        extraReducers: builder => {
            builder.addCase(get.fulfilled, (state, action) => action.payload)
            builder.addCase(sync.fulfilled, (state, action) => action.payload)
            builder.addCase(create.fulfilled, (state, action) => action.payload)
            builder.addCase(update.fulfilled, (state, action) => action.payload)

            builder.addCase(remove.fulfilled, () => null)
            builder.addCase(get.rejected, () => null)
        },
    });

    return {
        reducer: slice.reducer,
        actions: {...slice.actions, ...helper, create, update, remove},
    }
}


export class ImpossibleMerge extends Error {}


export interface PushSyncDescriptor<DATA, UPDATE> extends GenericSyncDescriptor<DATA> {
    api: WriteOnlyApi<DATA>,
    merge(a: DATA, b: DATA): DATA,
    getDataFromUpdate(update: UPDATE, state: RootState): DATA,
    errorHandler?: (
        error: Error,
        operation: Operation,
        dispatch: GenericDispatch
    ) => void,
}

interface PushSyncSetupActions<DATA, UPDATE> extends GenericSyncSetupActions {
    put: AsyncThunk<DATA, UPDATE, ThunkApi>,
}

interface PushSyncSetup<DATA, UPDATE> {
    reducer: Reducer<DATA|null>,
    actions: PushSyncSetupActions<DATA, UPDATE>,
}


export function createPushSyncReducer<DATA, UPDATE>(
    descriptor: PushSyncDescriptor<DATA, UPDATE>
): PushSyncSetup<DATA, UPDATE> {
    const name = descriptor.name;
    const handleError = getErrorHandlerWithoutId(descriptor);

    const put = createAsyncThunk<DATA, UPDATE, ThunkApi>(
        name + '/put',
        async (update: UPDATE, thunkApi) => {
            const dispatch = thunkApi.dispatch;
            const getState = thunkApi.getState;
            const rejectWithValue = thunkApi.rejectWithValue;

            const state = getState();
            const oldData = descriptor.getMyOwnState(state);
            const newData = descriptor.getDataFromUpdate(update, state);
            if ( oldData === null ) {
                return newData;
            }
            try {
                return descriptor.merge(oldData, newData);
            }
            catch(error) {
                if ( error instanceof ImpossibleMerge ) {
                    try {
                        await descriptor.api.create(oldData);
                        return newData;
                    }
                    catch (e) {
                        return rejectWithValue(handleError(error as Error, Operation.PUT, dispatch));
                    }
                } else {
                    throw error;
                }
            }
        }
    );

    const sync = createAsyncThunk<DATA | null, SyncFinisher, ThunkApi>(
        name + '/sync',
        async (finishSync, thunkApi) => {
            const dispatch = thunkApi.dispatch;
            const getState = thunkApi.getState;
            const rejectWithValue = thunkApi.rejectWithValue;

            const state = getState();
            const oldData= descriptor.getMyOwnState(state);
            try {
                if ( oldData ) {
                    await descriptor.api.create(oldData);
                }
                return null;
            }
            catch (error) {
                return rejectWithValue(handleError(error as Error, Operation.PUT, dispatch));
            }
            finally {
                finishSync();
            }
        }
    );

    const slice = createSlice({
        name,
        initialState: null as DATA | null,
        reducers: {
            invalidate: () => null,
        },
        extraReducers: builder => {
            builder.addCase(put.fulfilled, (state, action: PayloadAction<DATA>) => action.payload)
            builder.addCase(sync.fulfilled, () => null)
            builder.addCase(put.rejected, () => null)
        },
    });

    const startSync = getStartSyncThunk(descriptor, sync);
    const stopSync = getStopSyncThunk(descriptor);

    return {
        reducer: slice.reducer,
        actions: {...slice.actions,
            put, startSync, stopSync
        },
    }
}
