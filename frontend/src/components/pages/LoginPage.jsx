import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@material-tailwind/react";
import { useAuth } from '../hooks/auth';

import api from '../../api/index';


export default function LoginPage() {
    const navigate = useNavigate();

    const location = useLocation();

    const { login } = useAuth();

    const [username, setUsername] = useState('');

    const [password, setPassword] = useState('');

    const [error, setError] = useState('');


    let fromPage = location.state?.from?.pathname || '/';

    useEffect(() => {
        let username = localStorage.getItem('username');

        if (username) {
            setUsername(username);
        }
    }, [])

    function handleLogin(e) {
        e.preventDefault();

        api.ansarClient.login({ 'username': username, 'password': password })
            .then((resp) => {
                login(resp.data.access, resp.data.refresh);

                localStorage.setItem('username', username);

                navigate(fromPage, { replace: true });
            })

            .catch(() => {
                setError('Ошибка! Имя пользователя или пароль не верны.');
            })
    }

    return (
        <div>
            <form
                className='w-96 ml-auto mr-auto mt-32 p-4 border-2 border-white bg-formbgcolor rounded-md'>
                <div className='w-full pb-5'>
                    <img className="h-20 ml-auto mr-auto self-center" src="ansar.png" alt="ansar" />
                </div>
                <div
                    className='flex flex-col mb-5'
                >
                    <label
                        className='m-1 text-white'
                        htmlFor='username'>
                        Имя пользователя
                    </label>
                    <input
                        className='p-1 text-primary rounded'
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
                        className='m-1 text-white'
                        htmlFor='password'>Пароль</label>
                    <input
                        className='p-1 text-primary rounded'
                        type='password'
                        id='password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <p className='text-red-600 mt-2'>{error}</p>
                <div
                    className='flex flex-row justify-center mt-3'>
                    <Button
                        variant='outlined'
                        color='white'
                        size='md'
                        onClick={handleLogin}>
                        Войти
                    </Button>
                </div>
            </form>
        </div>
    );
}
