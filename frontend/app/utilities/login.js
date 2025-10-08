"use client"
import React, { useState } from 'react'
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/Session';
import { useRouter } from 'next/navigation';
import { usePassword } from '../Context/passwordContext';

const Login = () => {
    const dispatch = useDispatch();
    const router = useRouter();
    const { setMasterPassword } = usePassword();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const email = e.target[0].value;
        const password = e.target[1].value;

        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/login`, {
                method: 'POST', // Fixed: Changed from GET to POST
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emailid: email, password: password })
            });

            const data = await response.json();
            console.log(data);

            if (response.status === 200) {
                dispatch(setUser({ email: email }));
                setMasterPassword(password);
                router.push('/Home');
            } else {
                setError(data.error || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            setError('Server error. Please try again later.');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Back Button */}
                <button
                    onClick={() => router.push('/')}
                    className="cursor-pointer text-purple-300 hover:text-white mb-8 flex items-center gap-2 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back
                </button>

                {/* Login Card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-2xl">
                    {/* Icon */}
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-xl mb-6 shadow-lg shadow-purple-500/50">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>

                    <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                    <p className="text-purple-200 mb-8">Sign in to access your secure vault</p>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                            <p className="text-red-200 text-sm flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {error}
                            </p>
                        </div>
                    )}

                    <form onSubmit={onSubmit} className="space-y-6">
                        {/* Email Input */}
                        <div>
                            <label className="block text-purple-200 text-sm font-medium mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                    </svg>
                                </div>
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-purple-200 text-sm font-medium mb-2">
                                Master Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                    </svg>
                                </div>
                                <input
                                    type="password"
                                    placeholder="Enter your master password"
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="cursor-pointer w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-purple-500/50 transition-all duration-200 hover:scale-105 hover:shadow-purple-500/70 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Logging In...
                                </>
                            ) : (
                                'Log In'
                            )}
                        </button>
                    </form>

                    {/* Sign Up Link */}
                    <div className="mt-6 text-center">
                        <p className="text-purple-300 text-sm">
                            Don't have an account?{' '}
                            <button
                                onClick={() => router.push('/signup')}
                                className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                            >
                                Create one now
                            </button>
                        </p>
                    </div>
                </div>

                {/* Security Note */}
                <div className="mt-6 text-center">
                    <p className="text-purple-400 text-xs flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Your connection is encrypted and secure
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Login