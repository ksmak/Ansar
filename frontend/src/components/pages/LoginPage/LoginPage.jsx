// React, Redux, Router
import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from "react-router-dom"

// Project
import api from '../../../api/index'
import { login } from '../../../slices/ansarClientSlice'

// Components
import Button from '../../UI/Button/Button'
import Input from '../../UI/Input/Input'
import Label from '../../UI/Label/Label'
import Error from '../../UI/Error/Error'

// CSS
import cls from './LoginPage.module.scss'

const LoginPage = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const onLogin = (e) => {
        e.preventDefault();
        
        api.ansarClient.login({'username': username, 'password': password})
            .then((resp) => {
                dispatch(login({username: username}));
                sessionStorage.setItem('access_token', resp.data.access)
                sessionStorage.setItem('refresh_token', resp.data.refresh)
                setError('');
                navigate('/');
            })
            .catch(() => {
                setError('Ошибка! Имя пользователя или пароль не верны.')
            })
    }

    return (
        <div className='content'>
            <form className={cls.login__form}>
                <h2>Вход в систему</h2>
                <div>
                    <Label htmlFor='username'>Имя пользователя</Label>
                    <Input 
                        type="text" 
                        id='username' 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                    />
                </div>
                <div>
                    <Label htmlFor='password'>Пароль</Label>
                    <Input 
                        type='password' 
                        id='password' 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <Error error={error} />
                <div className={cls.login__button}>
                    <Button onClick={onLogin}>Войти</Button>
                </div>
            </form>
        </div>
    );
};

export default LoginPage