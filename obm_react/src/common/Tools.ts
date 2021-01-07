import {GenericDispatch} from '../redux/Types'
import {actions} from '../redux/Store';


export function internalError(message: string): never {
    const e = new Error(message);
    console.log('INTERNAL ERROR: ' + message);
    console.log(e.stack);
    throw  e;
}

export async function handleUserAction(action: () => void, dispatch: GenericDispatch) {
    try {
        dispatch(actions.messages.reset());
        await action();
    }
    catch (error) {
        const message = error.toString();
        dispatch(actions.messages.reportError(message));
    }
}
