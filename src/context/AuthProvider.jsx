import { createContext, useState } from "react";

const AuthContext = createContext();

const AuthProvider = ({children}) => {
    const [auth, setAuth] = useState({});
    const updateAuth = (data) => {
        setAuth(data);
    }
    return (
        <AuthContext.Provider value = {{auth, updateAuth}}>
            {children}
        </AuthContext.Provider>
    )
}

export { AuthContext, AuthProvider};