import React, { useState } from 'react'
import { IoPersonOutline, IoLockClosedOutline, IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5'
import './Login.css'


export default function Login({ setLoggedIn, setUser }) {

    const [passShow, setPassShow] = useState(false)
    const [register, setRegister] = useState(false)
    const [actionData, setActionData] = useState(null)

    function action(event) {
        event.preventDefault()
        const formData = new FormData(event.target)
        const username = formData.get('username')
        const password = formData.get('password')
        const data = { username, password }
        const url = register ? 'http://localhost:5000/auth/register' : 'http://localhost:5000/auth/login'
        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        }

        fetch(url, options)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok')
                }
                return response.json()
            })
            .then((data) => {
                if (data.token) {
                    localStorage.setItem('token', data.token)
                    setLoggedIn(true)
                    setUser(data.user)
                } else {
                    console.error('Login failed:', data.error)
                }
            })
            .catch((error) => {
                console.error('Error:', error)
            })

        setActionData(data.error)
    }

    return (
        <div className='login-container'>
            <form method='post' onSubmit={action}>
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
                <button type='submit'>{register ? 'Register' : 'Log in'}</button>
                <p className='switch-form' onClick={() => setRegister(!register)}>{register ? 'Already have an account?' : 'Create a new account!'}</p>
            </form>
        </div>
    )
}
