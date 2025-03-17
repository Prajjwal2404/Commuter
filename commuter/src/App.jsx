import React, { useLayoutEffect, useState } from 'react'
import Map from './Map'
import Login from './Login'

const App = () => {

    const [loggedIn, setLoggedIn] = useState(false)
    const [user, setUser] = useState(null)

    const token = localStorage.getItem("token")

    useLayoutEffect(() => {

        if (token) {
            fetch("http://localhost:5000/auth/verify", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Token is invalid")
                    }
                    return response.json()
                })
                .then((data) => {
                    setLoggedIn(true)
                    setUser(data.user)
                })
                .catch((error) => {
                    console.error(error)
                    localStorage.removeItem("token")
                    setLoggedIn(false)
                    setUser(null)
                })
        } else {
            setLoggedIn(false)
            setUser(null)
        }
    }, [])

    return (
        loggedIn ? <Map user={user} setLoggedIn={setLoggedIn} setUser={setUser} /> :
            <Login setLoggedIn={setLoggedIn} setUser={setUser} />
    )
}

export default App