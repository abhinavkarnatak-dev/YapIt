"use client";

import { ArrowRight, Loader2, Lock } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, { useState } from 'react'

const VerifyOTP = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const searchParams = useSearchParams();

    const email: string = searchParams.get("email") || ""

    const handleSubmit = async () => { }
    return (
        <div className="bg-surface text-on-surface h-screen flex flex-col">
            <main className="flex-grow flex items-center justify-center px-6 py-12 lg:py-20 relative overflow-hidden">
                <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-primary/10 rounded-full blur-[100px] -z-10"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-[30rem] h-[30rem] bg-secondary/10 rounded-full blur-[120px] -z-10"></div>

                <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="hidden lg:flex flex-col space-y-8 pr-12">
                        <div className="space-y-4">
                            <h1 className="text-6xl font-extrabold text-on-surface leading-[1.1] tracking-tight font-headline">
                                Seamless <span className="bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">real-time</span> messaging.
                            </h1>
                            <p className="text-xl text-on-surface-variant max-w-md leading-relaxed">
                                Connect instantly with friends and family. YapIt provides lightning-fast chat, rich media sharing, and secure conversations all in one place.
                            </p>
                        </div>
                        <div className="bg-surface-container-low p-6 rounded-xl relative overflow-hidden">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center overflow-hidden">
                                    <img
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGp7aBq7z3-9moxUSzpkZi0shlvv7GOQa2ypD80s6KfsVYozwsD8VTaStNxYxjiv1BoVU8pfHl5jqk5F7CuWvUMtL93F-OpexkBXcImnjuou2Eh5YxnBUYHX4EGxD6pUDHD22M-DELsyTs5NHhRKpA9imsLxVGdgjU2x_HAq6aS_PZVC92xV4xevr4ebwimDOQfRlRnRshxt9PlyDk4ALnGTZ2QihPwZCxuisCxE9XNdPe5vfyvS4TaOZpqTpfPJ1etW86ZSuQyKYC"
                                    />
                                </div>
                                <div>
                                    <p className="font-bold text-on-surface">Alex River</p>
                                    <p className="text-sm text-secondary font-medium">Online</p>
                                </div>
                            </div>
                            <div className="bg-primary text-on-primary p-4 rounded-xl rounded-br-sm text-sm max-w-[80%]">
                                Hey! Are we still on for the sync later? Let me know! 🚀
                            </div>
                        </div>
                    </div>

                    <div className="w-full max-w-md mx-auto">
                        <div className="bg-surface-container-lowest p-8 lg:p-12 rounded-xl shadow-[0_20px_50px_rgba(55,39,77,0.06)] space-y-8 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-primary-container"></div>

                            <div className="space-y-2 text-center lg:text-left">
                                <h2 className="text-3xl font-bold text-on-surface tracking-tight font-headline">Verify OTP</h2>
                                <p className="text-on-surface-variant">Enter the OTP sent to your email address</p>
                                <p className="text-on-surface-variant">{email}</p>
                            </div>

                            <form className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-on-surface px-1" htmlFor="email">Email Address</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="w-5 h-5 text-outline group-focus-within:text-primary transition-colors" />
                                        </div>
                                        <input
                                            className="w-full pl-12 pr-4 py-4 bg-surface-container-low border-none rounded-full text-on-surface placeholder:text-outline-variant focus:ring-2 focus:ring-primary-fixed-dim/30 focus:bg-surface-bright transition-all duration-300"
                                            id="email"
                                            name="email"
                                            placeholder="Your Email"
                                            required
                                            type="email"
                                        //   value={email}
                                        //   onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <button className="w-full py-4 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold rounded-full shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 group" type="submit" onClick={handleSubmit}
                                        disabled={loading}>
                                        {loading ? (<>
                                            <span>Verifying OTP</span><Loader2 className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                        ) : (<>
                                            <span>Verify OTP</span><ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </>
                                        )}

                                    </button>
                                </div>
                            </form>

                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-surface-container-high"></div>
                                </div>
                            </div>

                            <p className="text-center text-sm text-on-surface-variant">
                                Don't have an account?
                                <Link className="text-primary font-bold hover:underline ml-1" href="/signup">Sign up here</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default VerifyOTP