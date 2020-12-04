import React, {Component} from 'react';
import Cookies from 'universal-cookie';
import Updater from './common/Updater';
import {Mode, GlobalActionDirectory} from './common/Types';
import {Admin} from './admin/Admin'
import {AdminLogin} from './admin/AdminLogin'
import {User} from './user/User';
import './App.css';


export interface AppState {
    mode: Mode,
    adminSecret?: string,
    updater: Updater,
    selectedMapSet?: string,
    knownMapSets: string[],
    errorMessage?: string,
}

const cookies = new Cookies();

const StringToMode: { [name: string]: Mode } = {
    'Admin': Mode.Admin,
    'User': Mode.User,
    // AdminLogin is only used internally - we should never need to deserialize it!
}

function getModeFromCookie(): Mode {
    const value: string = cookies.get('OBM-Mode')
    if ( value in StringToMode ) {
        return StringToMode[value];
    } else {
        return Mode.User;
    }
}

function getKnownMapSetsFromCookie(): string[] {
    const value: string = cookies.get('obm_known_map_sets')
    if ( value == null ) {
        return [];
    } else {
        return value.split(',');
    }
}

export function getInitialAppState(): AppState {
    return {
        mode: getModeFromCookie(),
        adminSecret: cookies.get('obm_admin_secret'),
        updater: new Updater(100),
        selectedMapSet: cookies.get('obm_selected_map_set'),
        knownMapSets: getKnownMapSetsFromCookie(),
    };
}


export class App extends Component<{}, AppState> {
    state: AppState = getInitialAppState();

    render() {
        let actionDirectory = this.getGlobalActionDirectory();
        let elements;
        switch (this.state.mode) {
            case(Mode.Admin): {
                elements = <Admin globalActionDirectory={actionDirectory} />;
                break;
            }
            case(Mode.AdminLogin): {
                elements = <AdminLogin globalActionDirectory={actionDirectory} />;
                break;
            }
            default: {
                elements = <User globalActionDirectory={actionDirectory} />;
            }
        }
        if ( this.state.errorMessage == null ) {
            return elements;
        } else {
            return (
                <div>
                    <div className="App-message">{this.state.errorMessage}</div>
                    {elements}
                </div>
            );
        }
    }
    
    getGlobalActionDirectory(): GlobalActionDirectory {
        return {
            setMode: (newMode: Mode) => { this.setMode(newMode) },
            selectMapSet: (uuid: string) => { this.selectMapSet(uuid) },
            loginAdmin: (adminSecret: string) => { this.loginAdmin(adminSecret) },
            logoutAdmin: () => { this.logoutAdmin() },
            handleResponse: (response: Response) => { this.handleResponse(response) },
        };
    }
    
    getStateCopy(): AppState {
        let state = this.state;
        return {
            mode: state.mode,
            adminSecret: state.adminSecret,
            updater: state.updater,
            selectedMapSet: state.selectedMapSet,
            knownMapSets: state.knownMapSets,
            errorMessage: state.errorMessage,
        };
    }
    
    setMode(newMode: Mode): void {
        let newState = this.getStateCopy();
        newState.mode = newMode;
        this.setState(newState);
    }
    
    selectMapSet(uuid: string): void {
        let newState = this.getStateCopy();
        newState.selectedMapSet = uuid;
        newState.mode = Mode.User;
        this.setState(newState);
        cookies.set('obm_selected_map_set', uuid);
    }

    loginAdmin(adminSecret: string): void {
        let newState = this.getStateCopy();
        newState.adminSecret = adminSecret;
        newState.mode = Mode.Admin;
        this.setState(newState);
        cookies.set('obm_admin_secret', adminSecret);
    }

    logoutAdmin(): void {
        let newState = this.getStateCopy();
        newState.adminSecret = undefined;
        newState.mode = Mode.User;
        this.setState(newState);
        cookies.remove('obm_admin_secret');
    }

    handleResponse(response: Response): void {
        let newState = this.getStateCopy();
        if ( response.ok ) {
            newState.errorMessage = undefined;
        } else {
            newState.errorMessage = response.status + ' ' + response.statusText;
        }
        if ( newState.errorMessage !== this.state.errorMessage ) {
            this.setState(newState);
        }
    }
}

export default App;
