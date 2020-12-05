import {useSelector} from 'react-redux';
import {AdminButton} from './AdminButton';
import {RootState} from '../redux/Types';


export function User() {
    const uuid = useSelector((state: RootState) => state.cookies.selectedMapSet);
    return (
        <div className="User">
            <header className="App-header">
                <h1>Open Battle Map - {uuid}</h1>
            </header>
            <AdminButton />
        </div>
    );
}

export default User;