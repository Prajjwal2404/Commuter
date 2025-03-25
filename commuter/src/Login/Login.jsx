import React, { useActionState, useContext, useState } from 'react'
import { IoPersonOutline, IoLockClosedOutline, IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5'
import { FaCircle } from "react-icons/fa6"
import useUser from '../Components/useUser'
import './Login.css'

const Login = () => {

    const { setUser } = useContext(useUser)
    const [register, setRegister] = useState(false)
    const [passShow, setPassShow] = useState(false)
    const [actionData, formAction, submitting] = useActionState(action, null)

    async function action(_, formData) {
        const username = formData.get('username')
        const password = formData.get('password')
        const domain = import.meta.env.VITE_DOMAIN
        const url = register ? `${domain}/auth/register` : `${domain}/auth/login`
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        }

        try {
            const response = await fetch(url, options)
            if (!response.ok) {
                const message = await response.text()
                throw new Error(message)
            }
            const data = await response.json()
            if (data.token) {
                localStorage.setItem('token', data.token)
                setUser(data.user)
            } else {
                console.error('Login failed')
            }
        } catch (error) {
            console.error(error)
            return error.message
        }
        return null
    }

    return (
        <div className='login-container'>
            <form action={formAction} inert={submitting}>
                <h1>{register ? 'Register' : 'Login'}</h1>
                {actionData && <h4>{actionData}</h4>}
                <label className='input-box'>
                    <IoPersonOutline className="icon" />
                    <input type="text" name="username" placeholder='Username' required />
                </label>
                <label className='input-box'>
                    <IoLockClosedOutline className="icon" />
                    {passShow ? <IoEyeOffOutline className='pass-icon' onClick={() => setPassShow(false)} /> :
                        <IoEyeOutline className='pass-icon' onClick={() => setPassShow(true)} />}
                    <input type={passShow ? "text" : "password"} name="password" placeholder='Password'
                        minLength={8} required />
                </label>
                {!submitting ? <button type='submit'>{register ? 'Register' : 'Log in'}</button> :
                    <button className='submitting-btn' type='button' disabled><FaCircle /></button>}
                <p className='switch-form' onClick={() => setRegister(!register)}>{register ? 'Already have an account?' : 'Create a new account!'}</p>
            </form>
        </div>
    )
}

export default Login