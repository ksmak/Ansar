import React, { useState } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/index';


const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const { onLogin } = useAuth();

    let fromPage = location.state?.from?.pathname || '/';

    const onSignIn = (e) => {
        e.preventDefault();

        api.ansarClient.login({ 'username': username, 'password': password })
            .then((resp) => {
                onLogin(resp.data, () => navigate(fromPage, { replace: true }));
            })
            .catch(() => {
                setError('Ошибка! Имя пользователя или пароль не верны.');
            })
    }

    return (
        <div>
            <form
                className='w-96 ml-auto mr-auto mt-32 p-4 border-2 border-white bg-formbgcolor rounded-md'>
                <div
                    className='flex flex-col mb-5'
                >
                    <label
                        className='m-1 font-mono text-white'
                        htmlFor='username'>
                        Имя пользователя
                    </label>
                    <input
                        className='p-1 font-mono text-primary rounded'
                        type='text'
                        id='username'
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div
                    className='flex flex-col'
                >
                    <label
                        className='m-1 font-mono text-white'
                        htmlFor='password'>Пароль</label>
                    <input
                        className='p-1 font-mono text-primary rounded'
                        type='password'
                        id='password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <p className='font-mono text-red-600 mt-2'>{error}</p>
                <div
                    className='flex flex-row justify-center mt-3'>
                    <button
                        className='font-mono p-2 uppercase font-bold text-sm text-white bg-transparent rounded-md border-2 border-white hover:bg-white hover:text-formbgcolor'
                        onClick={onSignIn}>
                        Войти
                    </button>
                </div>
            </form>
        </div>
    );
};

export default LoginPage