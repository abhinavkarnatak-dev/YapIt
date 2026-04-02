"use client";

import { ArrowRight, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import AuthHeader from '@/components/AuthHeader';
import { useAppData, user_service } from '@/context/AppContext';
import Loading from './Loading';

const VerifyOtp = () => {
    const { isAuth, setIsAuth, setUser, userLoading } = useAppData();
    const [loading, setLoading] = useState<boolean>(false);
    const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
    const [resendLoading, setResendLoading] = useState<boolean>(false);
    const [timer, setTimer] = useState<number>(60);
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
    const router = useRouter();
    const searchParams = useSearchParams();

    const email: string = searchParams.get("email") || ""

    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const handleInputChange = (index: number, value: string): void => {
        if (value.length > 1) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLElement>): void => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>): void => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text");
        const digits = pastedData.replace(/\D/g, "").slice(0, 6);
        if (digits.length === 6) {
            const newOtp = digits.split("");
            setOtp(newOtp);
            inputRefs.current[5]?.focus();
        }
    };

    const handleResendOTP = async () => {
        setResendLoading(true);
        try {
            const { data } = await axios.post(`${user_service}/api/v1/login`, { email });
            toast.success(data.message);
            setTimer(60);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            setResendLoading(false);
        }
    }

    const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const otpString = otp.join("");
        if (otpString.length !== 6) {
            toast.error("Please enter a valid OTP");
            return;
        }
        setLoading(true);
        try {
            const { data } = await axios.post(`${user_service}/api/v1/verify`, {
                email, 
                enteredOtp: otpString
            });
            toast.success(data.message);
            Cookies.set('token', data.token, { expires: 15, secure: false, path: '/' });
            setIsAuth(true);
            setUser(data.user);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
            router.push(`/chat`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (isAuth) {
            router.push("/chat");
        }
    }, [isAuth, router]);

    if(userLoading || isAuth) {
        return <Loading />
    }
    return (
        <div className="bg-surface text-on-surface h-screen flex flex-col">
            <AuthHeader />
            <main className="flex-grow flex items-center justify-center px-6 py-12 lg:py-20 relative overflow-hidden">
                <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-primary/10 rounded-full blur-[100px] -z-10"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-[30rem] h-[30rem] bg-secondary/10 rounded-full blur-[120px] -z-10"></div>

                <div className="w-full w-screen items-center">


                    <div className="w-full max-w-md mx-auto">
                        <div className="bg-surface-container-lowest p-8 lg:p-12 rounded-xl shadow-[0_20px_50px_rgba(55,39,77,0.06)] space-y-12 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-primary-container"></div>

                            <div className="space-y-2 text-center lg:text-left">
                                <h2 className="text-3xl font-bold text-on-surface tracking-tight font-headline">Verify OTP</h2>
                                <p className="text-on-surface-variant">Enter the OTP sent to your email address</p>
                                <p className="text-primary">{email}</p>
                            </div>

                            <form className="space-y-6">
                                <div className="space-y-2 flex flex-col items-sart">
                                    <div className="relative group">
                                        <div className="flex justify-center in-checked: space-x-3">
                                            {
                                                otp.map((digit, index) => (
                                                    <input key={index} ref={(el: HTMLInputElement | null) => { inputRefs.current[index] = el }}
                                                        type="text"
                                                        inputMode="numeric"
                                                        maxLength={1}
                                                        value={digit}
                                                        onChange={(e) => handleInputChange(index, e.target.value)}
                                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                                        onPaste={index === 0 ? handlePaste : undefined}
                                                        className="w-12 h-12 text-center text-2xl font-bold rounded-lg border-2 border-outline focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 bg-surface-container-low text-on-surface" />
                                                ))
                                            }
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <button className="w-full py-4 bg-gradient-to-br from-primary to-primary-container text-on-primary font-bold rounded-full shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer" type="submit" onClick={handleSubmit}
                                        disabled={loading}>
                                        {loading ? (<>
                                            <span>Verifying OTP</span><Loader2 className="w-5 h-5 group-hover:translate-x-1 transition-transform cursor-pointer" />
                                        </>
                                        ) : (<>
                                            <span>Verify OTP</span><ArrowRight className="w-5 h-5" />
                                        </>
                                        )}

                                    </button>
                                </div>
                            </form>
                            <div>
                                {timer > 0 ? <p className='text-center'>Resend OTP in {timer} seconds</p> : <p className='text-center'>Didn't receive an OTP? <button className='text-primary font-bold cursor-pointer' onClick={handleResendOTP}>Resend OTP</button></p>}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default VerifyOtp