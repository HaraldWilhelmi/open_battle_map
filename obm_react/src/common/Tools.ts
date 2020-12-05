import {ReduxDispatch} from '../redux/Store';
import {reportError, reportSuccess, resetMessages} from '../redux/Messages';

export function handleResponse(
    dispatch: ReduxDispatch,
    response: Response,
    whileDoingWhat: string = '',
    isUserTriggered: boolean = true,
): void {
    if ( isUserTriggered ) {
        dispatch(resetMessages());
    }
    if ( response.ok ) {
        if ( whileDoingWhat !== '' ) {
            dispatch(reportSuccess('Succeeded ' + whileDoingWhat + '.'));
        }
    } else {
        if ( whileDoingWhat === '' ) {
            dispatch(reportError(response.status + ' ' + response.statusText));
        } else {
            dispatch(
                reportError('Failed ' + whileDoingWhat + ': '
                    + response.status + ' ' + response.statusText
                )
            );
        }
    }
}
