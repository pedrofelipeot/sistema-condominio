'use client';
import { useState } from 'react';
import Campo from '../components/Campo';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!email || !password) {
            setError('Por favor, preencha todos os campos.');
            return;
        }

        setError('');
        console.log('Email:', email);
    }

    return (
        <div>
            <h1>Página de Login</h1>
            <form onSubmit={handleSubmit}>
                <Campo label="Email" id="email" type="email" value={email} onChange={setEmail} />
                <Campo label="password" id="password" type="password" value={password} onChange={setPassword} />
                <button type="submit">Entrar</button>
            </form>
            {error && <p role="alert">{error}</p>}
        </div>
    );
}