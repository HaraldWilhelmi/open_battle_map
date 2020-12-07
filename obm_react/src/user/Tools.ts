import {ReduxDispatch} from '../redux/Store';
import {handleResponse} from '../common/Tools';
import {setSelectedMapSet, SelectedMapSet, NO_SUCH_MAP_SET} from '../redux/SelectedMapSet';
import {reportError} from '../redux/Messages';


export async function updateSelectedMapSet(dispatch: ReduxDispatch, uuid: string) {
    if ( uuid.length < 10 ) {
        dispatch(setSelectedMapSet(NO_SUCH_MAP_SET));
        dispatch(reportError('Bad Map Set URL!'));
        return;
    }
    let response = await(
        fetch('/api/map_set/' + uuid)
    );
    if (response.ok) {
        let selectedMapSet: SelectedMapSet = await(response.json());
        dispatch(setSelectedMapSet(selectedMapSet));
    } else {
        if (response.status === 404) {
            dispatch(setSelectedMapSet(NO_SUCH_MAP_SET));
            dispatch(reportError('Map Set not found!'));
        } else {
            handleResponse(dispatch, response, '', false);
        }
    }
}
