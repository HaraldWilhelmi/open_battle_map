import {AnyAction, Reducer} from 'redux';
import {AsyncThunk, createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Operation, ReadOnlyApi, UpdatableApi, WriteOnlyApi} from '../api/ApiTools';
import {GenericDispatch, RootState, SyncDescriptor, SyncFinisher, ThunkApi, ThunkRejectReasons} from './Types';
import {syncerActions} from './reducers/Syncer';
import {messagesActions} from './reducers/Messages';
import {ApiError} from "../api/UnpackResponse";
import {reportApiProblem} from "../common/ApiLogs";
import {isSuccess, Result} from "../common/Result";


export interface GenericSyncDescriptor<DATA, CONFIG, CONTEXT> {
    name: string,
    syncPeriodInMs: number,
    getMyOwnState(state: RootState): DATA | null,
    getInitialState(config: CONFIG): Promise<DATA | null>,
    errorHandler?(error: Error, operation: Operation, context: CONTEXT|undefined, dispatch: GenericDispatch): Result<void>,
}

export interface GenericSyncSetupActions<DATA, CONFIG> {
    invalidate: () => AnyAction,
    startSync: AsyncThunk<DATA | null, CONFIG, ThunkApi>,
    stopSync: AsyncThunk<void, undefined, ThunkApi>,
}


export interface ReadOnlySyncDescriptor<DATA, CONFIG, CONTEXT> extends GenericSyncDescriptor<DATA, CONFIG, CONTEXT> {
    api: ReadOnlyApi<DATA, CONTEXT>,
}

export interface ReadOnlySyncSetupActions<DATA, CONFIG, CONTEXT>
    extends GenericSyncSetupActions<DATA, CONFIG>
{
    get: AsyncThunk<DATA, CONTEXT, ThunkApi>,
}

export interface ReadOnlySyncSetup<DATA, CONFIG, CONTEXT> {
    reducer: Reducer<DATA|null>,
    actions: ReadOnlySyncSetupActions<DATA, CONFIG, CONTEXT>,
}


type HandleError<CONTEXT> = (
    error: Error, operation:
    Operation, context: CONTEXT|undefined,
    dispatch: GenericDispatch
) => ThunkRejectReasons;


interface SyncHelper<DATA, CONFIG, CONTEXT> {
    handleError: HandleError<CONTEXT>,
    getContextOfLoadedData: (state: RootState) => CONTEXT | undefined,
    get: AsyncThunk<DATA, CONTEXT, ThunkApi>,
    sync: AsyncThunk<DATA, SyncFinisher, ThunkApi>,
    startSync: AsyncThunk<DATA | null, CONFIG, ThunkApi>,
    stopSync: AsyncThunk<void, undefined, ThunkApi>,
}


function createSyncHelper<DATA, CONFIG, CONTEXT>(
    descriptor: ReadOnlySyncDescriptor<DATA, CONFIG, CONTEXT>
): SyncHelper<DATA, CONFIG, CONTEXT> {
    const name = descriptor.name;

    const handleError = getErrorHandler(descriptor);

    const get = createAsyncThunk<DATA, CONTEXT, ThunkApi>(
        name + '/get',
        async (context: CONTEXT, thunkApi) => {
            const dispatch = thunkApi.dispatch;
            const rejectWithValue = thunkApi.rejectWithValue;
            try {
                return await descriptor.api.get(context);
            }
            catch(error) {
                return rejectWithValue(handleError(error as Error, Operation.GET, context, dispatch));
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
            const id = getContextOfLoadedData(stateBefore);
            let data: DATA | null = null;

            if ( id === undefined ) {
                finishSync();
                return rejectWithValue(ThunkRejectReasons.NothingToSync);
            }
            try {
                data = await descriptor.api.get(id);
            } catch (error) {
                finishSync(true);
                return rejectWithValue(handleError(error as Error, Operation.GET, id, dispatch));
            }
            if ( finishSync() ) {
                return data;
            } else {
                return rejectWithValue(ThunkRejectReasons.ObsoleteSync);
            }
        }
    );

    function getContextOfLoadedData(state: RootState): CONTEXT | undefined {
        const data= descriptor.getMyOwnState(state);
        if ( data === null ) {
            return undefined;
        } else {
            return descriptor.api.getContextOf(data);
        }
    }

    const startSync = getStartSyncThunk(descriptor, sync, handleError);
    const stopSync = getStopSyncThunk(descriptor);

    return {handleError, getContextOfLoadedData, get, sync, startSync, stopSync};
}

function getErrorHandler<DATA, CONFIG, CONTEXT>(descriptor: GenericSyncDescriptor<DATA, CONFIG, CONTEXT>):
    HandleError<CONTEXT>
{
    const handler = descriptor.errorHandler;
    if ( handler ) {
        return (error, operation, context, dispatch) => {
            handler(error, operation, context, dispatch);
            return handleGenericError(error, dispatch);
        }
    } else {
        return (error, operation, context, dispatch) => {
            return handleGenericError(error, dispatch);
        }
    }
}

function handleGenericError(error: Error, dispatch: GenericDispatch): ThunkRejectReasons {
    if ( error instanceof ApiError ) {
        dispatch(messagesActions.reportError(error.message));
    } else {
        reportApiProblem(error);
    }
    return ThunkRejectReasons.ApiError;
}

function getStartSyncThunk<DATA, CONFIG, CONTEXT>(
    descriptor: GenericSyncDescriptor<DATA, CONFIG, unknown>,
    syncThunk: AsyncThunk<DATA, SyncFinisher, ThunkApi>,
    handleError: HandleError<CONTEXT>,
):
    AsyncThunk<DATA|null, CONFIG, ThunkApi>
{
    const name = descriptor.name;
    const syncDescriptor: SyncDescriptor<DATA> = {
        syncKey: name,
        syncPeriodInMs: descriptor.syncPeriodInMs,
        syncThunk,
    }

    return createAsyncThunk(
        name + '/startSync',
        async (config, thunkApi) => {
            const dispatch = thunkApi.dispatch;
            const rejectWithValue = thunkApi.rejectWithValue;
            dispatch(syncerActions.add(syncDescriptor));
            try {
                return await descriptor.getInitialState(config);
            } catch (error) {
                return rejectWithValue(handleError(error as Error, Operation.GET, undefined, dispatch));
            }
        }
    );
}


function getStopSyncThunk<DATA>(
    descriptor: GenericSyncDescriptor<DATA, unknown, unknown>):
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

export function createReadonlySyncReducer<DATA, CONFIG, CONTEXT>(
    descriptor: ReadOnlySyncDescriptor<DATA, CONFIG, CONTEXT>
): ReadOnlySyncSetup<DATA, CONFIG, CONTEXT> {
    const name = descriptor.name;

    const helper = createSyncHelper(descriptor);
    const get = helper.get;
    const sync = helper.sync;

    const slice = createSlice({
        name,
        initialState: null as DATA | null,
        reducers: {invalidate: () => null},
        extraReducers: builder => {
            builder.addCase(
                get.fulfilled,
                (state, action) => action.payload
            )
            builder.addCase(
                sync.fulfilled,
                (state, action) => action.payload
            )
            builder.addCase(
                helper.startSync.fulfilled,
                (state, action) => action.payload
            )
            builder.addCase(get.rejected, () => null)
        },
    });

    return {
        reducer: slice.reducer,
        actions: {...slice.actions, ...helper},
    }
}


export interface UpdatableSyncDescriptor<DATA, CONFIG, CONTEXT, CREATE>
    extends GenericSyncDescriptor<DATA, CONFIG, CONTEXT>
{
    api: UpdatableApi<DATA, CONTEXT, CREATE>,
}

export interface UpdatableSyncSetupActions<DATA, CONFIG, CONTEXT, CREATE>
    extends ReadOnlySyncSetupActions<DATA, CONFIG, CONTEXT>
{
    create: AsyncThunk<DATA, CREATE, ThunkApi>,
    update: AsyncThunk<DATA, DATA, ThunkApi>,
    remove: AsyncThunk<CONTEXT, CONTEXT, ThunkApi>,
}

export interface UpdatableSyncSetup<DATA, CONFIG, CONTEXT, CREATE> {
    reducer: Reducer<DATA|null>,
    actions: UpdatableSyncSetupActions<DATA, CONFIG, CONTEXT, CREATE>,
}


export function createUpdatableSyncReducer<DATA, CONFIG, CONTEXT, CREATE>(
    descriptor: UpdatableSyncDescriptor<DATA, CONFIG, CONTEXT, CREATE>
): UpdatableSyncSetup<DATA, CONFIG, CONTEXT, CREATE> {
    const name = descriptor.name;
    const matchesContextOf = descriptor.api.matchesContextOf;

    const helper = createSyncHelper(descriptor);
    const get = helper.get;
    const sync = helper.sync;
    const handleError = helper.handleError;
    const getContextOfLoadedData = helper.getContextOfLoadedData;

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
        async (updateRequest, thunkApi) => {
            const dispatch = thunkApi.dispatch;
            const getState = thunkApi.getState;
            const rejectWithValue = thunkApi.rejectWithValue;

            try {
                const state = getState();
                const id = getContextOfLoadedData(state);
                if ( id === undefined || ! matchesContextOf(id, updateRequest) ) {
                    return rejectWithValue(ThunkRejectReasons.InconsistentUpdate);
                }
                await descriptor.api.update(updateRequest);
                dispatch(syncerActions.obsoleteSync(name));
                return updateRequest;
            } catch(error) {
                const id = descriptor.api.getContextOf(updateRequest);
                return rejectWithValue(handleError(error as Error, Operation.POST, id, dispatch));
            }
        }
    );

    const remove = createAsyncThunk<CONTEXT, CONTEXT, ThunkApi>(
        name + '/remove',
        async (context: CONTEXT, thunkApi) => {
            const dispatch = thunkApi.dispatch;
            const getState = thunkApi.getState;
            const rejectWithValue = thunkApi.rejectWithValue;

            const data = descriptor.getMyOwnState(getState());
            if ( data === null || ! matchesContextOf(context, data) ) {
                return rejectWithValue(ThunkRejectReasons.InconsistentRemove);
            }
            try {
                await descriptor.api.remove(context);
                return context;
            } catch(error) {
                return rejectWithValue(handleError(error as Error, Operation.DELETE, context, dispatch));
            }
        }
    );

    const slice = createSlice({
        name,
        initialState: null as DATA | null,
        reducers: {invalidate: () => null},
        extraReducers: builder => {
            builder.addCase(
                get.fulfilled,
                (state, action) => action.payload
            )
            builder.addCase(
                sync.fulfilled,
                (state, action) => action.payload
            )
            builder.addCase(
                create.fulfilled,
                (state, action) => action.payload
            )
            builder.addCase(
                update.fulfilled,
                (state, action) => action.payload
            )
            builder.addCase(
                helper.startSync.fulfilled,
                (state, action) => action.payload
            )

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


export interface PushSyncDescriptor<DATA, CONFIG, CONTEXT, UPDATE> extends GenericSyncDescriptor<DATA, CONFIG, CONTEXT> {
    api: WriteOnlyApi<DATA, CONTEXT>,
    merge(a: DATA, b: DATA): Result<DATA>,
    isSame(a: DATA | null, b: DATA | null): boolean,
    getDataFromUpdate(update: UPDATE, state: RootState): DATA,
    getFlushData?(state: RootState): DATA | null,
}

interface PushSyncSetupActions<DATA, CONFIG, UPDATE> extends GenericSyncSetupActions<DATA, CONFIG> {
    put: AsyncThunk<DATA, UPDATE, ThunkApi>,
}

interface PushSyncSetup<DATA, CONFIG, UPDATE> {
    reducer: Reducer<DATA|null>,
    actions: PushSyncSetupActions<DATA, CONFIG, UPDATE>,
}


export function createPushSyncReducer<DATA, CONFIG, CONTEXT, UPDATE>(
    descriptor: PushSyncDescriptor<DATA, CONFIG, CONTEXT, UPDATE>
): PushSyncSetup<DATA, CONFIG, UPDATE> {
    const name = descriptor.name;
    const handleError = getErrorHandler(descriptor);

    function getContextOf(data: DATA): CONTEXT {
        return descriptor.api.getContextOf(data);
    }

    const put = createAsyncThunk<DATA, UPDATE, ThunkApi>(
        name + '/put',
        async (update: UPDATE, thunkApi) => {
            const dispatch = thunkApi.dispatch;
            const getState = thunkApi.getState;
            const rejectWithValue = thunkApi.rejectWithValue;

            const state = getState();
            const oldData = descriptor.getMyOwnState(state);
            const newData = descriptor.getDataFromUpdate(update, state);
            if ( ! oldData ) {
                return newData;
            }
            const result = descriptor.merge(oldData, newData);
            if ( isSuccess(result) ) {
                return result;
            } else {
                if ( result instanceof ImpossibleMerge ) {
                    try {
                        await descriptor.api.create(oldData);
                    } catch (e) {
                        return rejectWithValue(handleError(e as Error, Operation.PUT, getContextOf(oldData), dispatch));
                    }
                    return newData;
                }
                return rejectWithValue(handleError(result as Error, Operation.PUT, getContextOf(oldData), dispatch));
            }
        }
    );

    const sync = createAsyncThunk<DATA | null, SyncFinisher, ThunkApi>(
        name + '/sync',
        async (finishSync, thunkApi) => {
            const dispatch = thunkApi.dispatch;
            const getState = thunkApi.getState;
            const rejectWithValue = thunkApi.rejectWithValue;

            const oldState = getState();
            const oldData= descriptor.getMyOwnState(oldState);
            if ( oldData ) {
                try {
                    await descriptor.api.create(oldData);
                    const newState = getState();
                    const newData = descriptor.getMyOwnState(newState);
                    finishSync();
                    return descriptor.isSame(oldData, newData) ? null : newData;
                } catch (error) {
                    finishSync(true);
                    return rejectWithValue(handleError(error as Error, Operation.PUT, getContextOf(oldData), dispatch));
                }
            }
            finishSync();
            return null;
        }
    );

    const startSync = getStartSyncThunk(descriptor, sync, handleError);
    const stopSync = createAsyncThunk<void, undefined, ThunkApi>(
        name + '/stopSync',
        async (_, thunkApi) => {
            const dispatch = thunkApi.dispatch;
            const getState = thunkApi.getState;
            const rejectWithValue = thunkApi.rejectWithValue;

            const state = getState();
            let flushData = descriptor.getFlushData ? descriptor.getFlushData(state) : null;
            if ( flushData ) {
                try {
                    await descriptor.api.create(flushData);
                } catch (error) {
                    return rejectWithValue(
                        handleError(error as Error, Operation.PUT, getContextOf(flushData), dispatch)
                    );
                }
            }
            dispatch(syncerActions.remove(name));
        }
    );

    const slice = createSlice({
        name,
        initialState: null as DATA | null,
        reducers: {
            invalidate: () => null,
        },
        extraReducers: builder => {
            builder.addCase(put.fulfilled, (state, action: PayloadAction<DATA>) => action.payload);
            builder.addCase(put.rejected, (state) => state);
            builder.addCase(sync.fulfilled, (state, action: PayloadAction<DATA | null>) => action.payload);
            builder.addCase(startSync.fulfilled, (state, action: PayloadAction<DATA | null>) => action.payload);
            builder.addCase(stopSync.fulfilled, () => null);
            builder.addCase(stopSync.rejected, () => null);
        },
    });


    return {
        reducer: slice.reducer,
        actions: {...slice.actions,
            put, startSync, stopSync
        },
    };
}
