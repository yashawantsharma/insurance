import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
const api=import.meta.env.API_URL 



const Login = ({ switchToSignup }) => {
    const [loginInput, setLoginInput] = useState({
        email: "",
        password: ""
    })
    // console.log({api});
    const [error, setError] = useState({})
    const navigate = useNavigate();
    const logindata = async (e) => {
        e.preventDefault();

        let validationErrors = {};

        if (!loginInput.email) {
            validationErrors.email = "email is required*";
        }

        if (!loginInput.password) {
            validationErrors.password = "password is required";
        }
        console.log(loginInput);
        

        setError(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            try {
                const response = await axios.post(
                    `http://localhost:5050/user/login`,
                    loginInput
                );


                localStorage.setItem("role", response.data.user.role);
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("userid", response.data.user.id);

                alert("Login successfully");
                if (response.data.user.role === "agent") {
                    navigate("/agentdashboard");
                }
                else if (response.data.user.role === "admin") {
                    navigate("/");
                }
                else if (response.data.user.role === "user" || response.data.user.role === "employee") {
                    navigate("/userdashboard");
                }

            } catch (error) {
                alert("Invalid credentials");
                console.error(error);
            }
        }
    };

    return (
        <div className="fixed inset-0 w-screen h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 z-50">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            <form onSubmit={logindata} className="relative z-10 w-full max-w-md">
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20 transform transition-all duration-500 hover:shadow-purple-500/20 hover:shadow-2xl">

                    <div className="mb-8 text-center">
                        <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2 drop-shadow-lg">Welcome</h2>
                        <p className="text-white/60 text-sm font-medium">Sign in to your account</p>
                    </div>

                    <div className="space-y-5">
                        <div className="relative group">
                            <input
                                type="email"
                                placeholder="Email Address"
                                className="w-full px-4 py-3 pl-12 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white/20 backdrop-blur-sm text-white placeholder-white/50 transition-all duration-300 group-hover:border-purple-400/50 group-hover:bg-white/15"
                                value={loginInput.email}
                                onChange={(e) => setLoginInput({ ...loginInput, email: e.target.value })}
                            />
                            <span className="absolute left-4 top-3.5 text-xl">📧</span>
                        </div>
                        {error.email && <p className="text-red-400 text-sm font-medium flex items-center gap-2"><span>⚠️</span>{error.email}</p>}

                        <div className="relative group">
                            <input
                                type="password"
                                placeholder="Password"
                                className="w-full px-4 py-3 pl-12 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent focus:bg-white/20 backdrop-blur-sm text-white placeholder-white/50 transition-all duration-300 group-hover:border-purple-400/50 group-hover:bg-white/15"
                                value={loginInput.password}
                                onChange={(e) => setLoginInput({ ...loginInput, password: e.target.value })}
                            />
                            <span className="absolute left-4 top-3.5 text-xl">🔒</span>
                        </div>
                        {error.password && <p className="text-red-400 text-sm font-medium flex items-center gap-2"><span>⚠️</span>{error.password}</p>}

                        <button
                            type="submit"
                            className="w-full mt-8 py-3 px-4 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 text-white font-bold rounded-lg shadow-lg hover:shadow-purple-500/50 transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-900 uppercase tracking-widest text-sm"
                        >
                            Sign In
                        </button>
                    </div>

                    <div className="mt-6 text-center border-t border-white/10 pt-6">
                        <p className="text-white/60 text-sm">Don't have an account? <span onClick={switchToSignup} className="text-purple-400 cursor-pointer hover:text-pink-400 font-semibold transition-colors duration-300">Create one</span></p>
                    </div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-pink-500/10 to-blue-500/0 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
            </form>
        </div>
    )
}

export default Login
