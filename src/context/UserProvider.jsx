import { createContext, useState } from "react";

const UserContext = createContext();

const UserProvider = ({children}) => {
    const [user, setUser] = useState({});
    const updateUser = (data) => {
        setUser(data);
    }
    return (
        <UserContext.Provider value = {{user, updateUser}}>
            {children}
        </UserContext.Provider>
    )
}

export { UserContext, UserProvider};