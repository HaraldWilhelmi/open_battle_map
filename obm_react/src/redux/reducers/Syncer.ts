import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {v4 as uuidV4} from "uuid";
import {SyncDescriptor, SyncState, SyncStateItem, ThunkApi, Timer} from '../Types';

interface TimerUpdate {
    syncKey: string,
    timer: Timer,
}

interface AddSyncer extends TimerUpdate {
    uuid: string,
}

const INITIAL_STATE: SyncState = {};

export const slice = createSlice({
    name: 'syncer',
    initialState: INITIAL_STATE,
    reducers: {
        startSync: (state, action: PayloadAction<string>) => patchState(
            state, action.payload, (x) => ({...x, isSyncing: true, isObsolete: false})
        ),
        stopSync: (state, action: PayloadAction<string>) => patchState(
            state, action.payload, (x) => ({...x, isSyncing: false})
        ),
        obsoleteSync: (state, action: PayloadAction<string>) => patchState(
            state, action.payload, (x) => ({...x, isObsolete: true})
        ),
        setTimer: (state, action: PayloadAction<TimerUpdate>) => patchState(
            state, action.payload.syncKey, (x) => ({...x, timer: action.payload.timer})
        ),
        add: (state, action: PayloadAction<AddSyncer>) => {
            let newState = {...state};
            const syncKey = action.payload.syncKey;
            newState[syncKey] = {
                isActive: true,
                isSyncing: false,
                isObsolete: false,
                uuid: action.payload.uuid,
                timer: action.payload.timer,
            };
            return newState;
        },
        remove: (state, action: PayloadAction<string>) => patchState(
            state, action.payload, (x) => ({...x, isActive: false, isObsolete: true})
        ),
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

        const uuid = uuidV4();
        console.log('Syncer ' + syncKey + ' started - ' + uuid);
        const syncerState = getState().syncer;
        if ( syncKey in syncerState && syncerState[syncKey].isActive ) {
            const message = 'Syncer "' + syncKey + '" already active!"';
            console.log(message);
            throw Error(message);
        }

        function finishSync() {
            const myStateAfter = getState().syncer[syncKey];
            if ( ! myStateAfter.isActive || myStateAfter.uuid !== uuid ) {
                console.log('Syncer ' + syncKey + ' terminates obsolete run - ' + uuid);
                return false;
            }
            dispatch(slice.actions.stopSync(syncKey));
            const timer = window.setTimeout(doSync, delay);
            dispatch(slice.actions.setTimer({syncKey, timer}));
            console.log('Syncer ' + syncKey + ' has run - ' + uuid);
            console.log('Syncer ' + syncKey + ' isObsolte ' + myStateAfter.isObsolete + ' - '+ uuid);
            return ! myStateAfter.isObsolete;
        }

        function doSync() {
            dispatch(slice.actions.startSync(syncKey));
            dispatch(descriptor.syncThunk(finishSync));
        }
        const timer = window.setTimeout(doSync, delay);
        dispatch(slice.actions.add({syncKey, timer, uuid}));
    }
);

const remove = createAsyncThunk<void, string, ThunkApi>(
    'syncer/remove',
    async (syncKey: string, thunkApi) => {
        const dispatch = thunkApi.dispatch;
        const getState = thunkApi.getState;
        const mySyncState: SyncStateItem = getState().syncer[syncKey];

        if ( ! mySyncState || ! mySyncState.isActive ) {
            return;
        }
        console.log('Syncer ' + syncKey + ' is stopping - ' + mySyncState.uuid);
        if ( ! mySyncState.isSyncing ) {
            window.clearTimeout(mySyncState.timer);
            console.log('Syncer ' + syncKey + ' prevents future runs - ' + mySyncState.uuid);
        }
        dispatch(slice.actions.remove(syncKey));
    }
);

export const syncerActions = {
    add,
    remove,
    obsoleteSync: slice.actions.obsoleteSync,
};
export default slice.reducer;
