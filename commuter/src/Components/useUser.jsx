import { createContext, useState } from 'react'

const useUser = createContext()

const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null)

    return (
        <useUser.Provider value={{ user, setUser }}>
            {children}
        </useUser.Provider>
    )
}

export { UserProvider }
export default useUser