
export interface MapSetItem {
    uuid: string,
    name: string,
}

export enum Mode {
    Admin,
    AdminLogin,
    User,
}

export interface GlobalActionDirectory {
    setMode: (newMode: Mode) => void,
    selectMapSet: (uuid: string) => void,
    loginAdmin: (adminSecret: string) => void,
    logoutAdmin: () => void,
    handleResponse: (response: Response) => void,
}