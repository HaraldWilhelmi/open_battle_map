import {createSlice, PayloadAction, createAsyncThunk} from '@reduxjs/toolkit';
import {ThunkApi, Timer, SyncDescriptor, SyncStateItem, SyncState} from '../Types';

interface TimerUpdate {
    syncKey: string,
    timer: Timer,
};

const INITIAL_STATE: SyncState = {};

export const slice = createSlice({
    name: 'syncer',
    initialState: INITIAL_STATE,
    reducers: {
        startSync: (state, action: PayloadAction<string>) => patchState(
            state, action.payload, (x) => {
                return {...x, isSyncing: true, isObsolete: false};
            }
        ),
        stopSync: (state, action: PayloadAction<string>) => patchState(
            state, action.payload, (x) => {
                return {...x, isSyncing: false};
            }
        ),
        obsoleteSync: (state, action: PayloadAction<string>) => patchState(
            state, action.payload, (x) => {
                return {...x, isObsolete: true};
            }
        ),
        setTimer: (state, action: PayloadAction<TimerUpdate>) => patchState(
            state, action.payload.syncKey, (x) => {
                return {...x, timer: action.payload.timer };
            }
        ),
        add: (state, action: PayloadAction<TimerUpdate>) => {
            let newState = {...state};
            const syncKey = action.payload.syncKey;
            const item: SyncStateItem = {
                isSyncing: false,
                isObsolete: false,
                timer: action.payload.timer,
            };
            newState[syncKey] = item;
            return newState;
        },
        remove: (state, action: PayloadAction<string>) => {
            let newState = {...state};
            const syncKey = action.payload;
            delete newState[syncKey];
            return newState;
        },
    },
});

function patchState(state: SyncState, syncKey: string, patch: (x: SyncStateItem) => SyncStateItem): SyncState {
    let newState: SyncState = {...state};
    newState[syncKey] = patch(state[syncKey]);
    return newState;
}

const add = createAsyncThunk<void, SyncDescriptor<any>, ThunkApi>(
    'syncer/add',
    async (descriptor: SyncDescriptor<any>, thunkApi) => {
        const dispatch = thunkApi.dispatch;
        const getState = thunkApi.getState;
        const delay = descriptor.syncPeriodInMs;
        const syncKey = descriptor.syncKey;

        function doSync() {
            dispatch(slice.actions.startSync(syncKey));
            try { dispatch(descriptor.syncThunk()); }
            finally { dispatch(slice.actions.stopSync(syncKey)); }

            const timer = window.setTimeout(doSync, delay);
            dispatch(slice.actions.setTimer({syncKey, timer,}));
        }

        const syncerState = getState().syncer;
        if ( syncKey in syncerState ) {
            const message = 'Syncer "' + syncKey + '" already active!"';
            console.log(message);
            throw Error(message);
        }
        const timer = window.setTimeout(doSync, delay);
        dispatch(slice.actions.add({syncKey, timer}));
    }
);

const remove = createAsyncThunk<void, string, ThunkApi>(
    'syncer/remove',
    async (syncKey: string, thunkApi) => {
        const dispatch = thunkApi.dispatch;
        const getState = thunkApi.getState;
        const syncStateItem: SyncStateItem = getState().syncer[syncKey];
        window.clearTimeout(syncStateItem.timer);
        dispatch(slice.actions.remove(syncKey));
    }
);

export const syncerActions = {
    add,
    remove,
    obsoleteSync: slice.actions.obsoleteSync,
};
export default slice.reducer;
