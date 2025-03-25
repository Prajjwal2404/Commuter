import React, { use, Suspense, useRef, useContext } from 'react'
import useUser from './Components/useUser'
import Login from './Login/Login'
import Map from './Map/Map'

const App = () => {

    const verifyAttempt = useRef(false)

    return (
        <Suspense fallback={<div className='loading' />}>
            <Content verifyAttempt={verifyAttempt} />
        </Suspense>
    )
}

const Content = ({ verifyAttempt }) => {

    const { user, setUser } = useContext(useUser)

    const verifyToken = async () => {
        const token = localStorage.getItem("token")
        try {
            if (token) {
                const response = await fetch(`${import.meta.env.VITE_DOMAIN}/auth/verify`, {
                    method: "GET",
                    mode: 'cors',
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                if (!response.ok) {
                    const message = await response.text()
                    throw new Error(message)
                }
                const data = await response.json()
                verifyAttempt.current = true
                setUser(data.user)
                return data.user
            }
        } catch (error) {
            console.error(error)
            localStorage.removeItem("token")
        }
        verifyAttempt.current = true
        return null
    }

    if (!verifyAttempt.current) {
        const data = use(verifyToken())
        return (
            data ? <Map /> : <Login />
        )
    }

    return (
        user ? <Map /> : <Login />
    )

}

export default App