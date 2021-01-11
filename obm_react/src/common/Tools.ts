import {GenericDispatch} from '../redux/Types'
import {actions} from '../redux/Store';


export function internalError(message: string): never {
    const e = new Error(message);
    console.log('INTERNAL ERROR: ' + message);
    console.log(e.stack);
    throw  e;
}

export function handleUserAction(action: () => Promise<void>, dispatch: GenericDispatch): void {
    dispatch(actions.messages.reset());
    action().catch(
        error => {
            const message = error.toString();
            dispatch(actions.messages.reportError(message));
        }
    );
}
