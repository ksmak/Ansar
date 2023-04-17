// React, Redux, Router
import React, { useState } from 'react'
import { useNavigate, useLocation } from "react-router-dom"

// Project
import api from '../../../api/index';
import { useAuth } from '../../../hooks/useAuth';

// Components
import Button from '../../UI/Button/Button';
import Input from '../../UI/Input/Input';
import Label from '../../UI/Label/Label';
import Error from '../../UI/Error/Error';

// CSS
import cls from './LoginPage.module.scss';

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation(); 
    const {onLogin} = useAuth();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const fromPage = location.state?.from?.pathname || '/';

    const onSignIn = (e) => {
        e.preventDefault();
        
        api.ansarClient.login({'username': username, 'password': password})
            .then((resp) => {
                console.log(resp);
                onLogin(
                    resp.data.access,
                    resp.data.refresh,
                    () => navigate(fromPage, {replace: true})
                )
            })
            .catch(() => {
                setError('Ошибка! Имя пользователя или пароль не верны.');
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
                    <Button onClick={onSignIn}>Войти</Button>
                </div>
            </form>
        </div>
    );
};

export default LoginPage