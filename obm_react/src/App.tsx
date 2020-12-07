import {useSelector} from 'react-redux';
import {Mode} from './redux/Mode';
import Messages from './common/Messages';
import {RootState} from './redux/Types';
import Admin from './admin/Admin';
import AdminLogin from './admin/AdminLogin';
import User from './user/User';
import './App.css';


export function App()  {
    const mode: Mode = useSelector(
        (state: RootState) => state.mode
    );

    switch (mode) {
        case(Mode.Admin): {
            return <div>
                <Messages />
                <Admin />
            </div>;
        }
        case(Mode.AdminLogin): {
            return <div>
                <Messages />
                <AdminLogin />
            </div>;
        }
        default: {
            return <div>
                <Messages />
                <User />
            </div>;
        }
    }
}

export default App;
