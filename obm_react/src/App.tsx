import {useSelector} from 'react-redux';
import {RootState, Mode} from './redux/Types';
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
                <Admin />
            </div>;
        }
        case(Mode.AdminLogin): {
            return <div>
                <AdminLogin />
            </div>;
        }
        default: {
            return <div className="max-height">
                <User />
            </div>;
        }
    }
}

export default App;
