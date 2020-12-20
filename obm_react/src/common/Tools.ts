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

export function cronEffect(doSomething: () => void, milliseconds: number) {
    let timer: any;

    function doIt() {
        try {
            doSomething();
        }
        finally {
            timer = setTimeout(doIt, milliseconds);
        }
    }

    doIt();
    return () => clearTimeout(timer);
}