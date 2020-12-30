import {GenericDispatch} from '../redux/Types'
import {actions} from '../redux/Store';

export function handleResponse(
    dispatch: GenericDispatch,
    response: Response,
    whileDoingWhat: string = '',
    isUserTriggered: boolean = true,
): void {
    if ( isUserTriggered ) {
        dispatch(actions.messages.reset());
    }
    if ( response.ok ) {
        if ( whileDoingWhat !== '' ) {
            dispatch(actions.messages.reportSuccess('Succeeded ' + whileDoingWhat + '.'));
        }
    } else {
        let message = response.status + ' ' + response.statusText;
        if ( whileDoingWhat !== '' ) {
            message = 'Failed ' + whileDoingWhat + ': ' + response.status + ' ' + response.statusText
        }
        dispatch(actions.messages.reportError(message));
        throw new Error(message);
    }
}

export function internalError(message: string): never {
    const e = new Error(message);
    console.log('INTERNAL ERROR: ' + message);
    console.log(e.stack);
    throw  e;
}
