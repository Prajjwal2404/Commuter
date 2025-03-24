import React, { use, Suspense, useRef, useContext } from 'react'
import { flushSync } from 'react-dom'
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
        verifyAttempt.current = true
        const token = localStorage.getItem("token")
        try {
            if (token) {
                const response = await fetch("http://localhost:5000/auth/verify", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                if (!response.ok) {
                    const message = await response.text()
                    throw new Error(message)
                }
                const data = await response.json()
                flushSync(() => setUser(data.user))
            }
        } catch (error) {
            console.error(error)
            localStorage.removeItem("token")
        }
    }

    !verifyAttempt.current && use(verifyToken())

    return (
        user ? <Map /> : <Login />
    )

}

export default App