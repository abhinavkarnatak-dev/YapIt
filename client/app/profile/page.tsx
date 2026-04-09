"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Save, Upload, Camera, Loader2, User as UserIcon, Check } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { useAppData, user_service } from '@/context/AppContext';
import Loading from '@/components/Loading';
import { useSocket } from '@/context/SocketContext';
import Cropper from 'react-easy-crop';
import getCroppedImg from '@/utils/cropImage';

const ProfilePage = () => {
    const { user, isAuth, userLoading, setUser, setIsAuth } = useAppData();
    const { socket } = useSocket();
    const router = useRouter();

    const [name, setName] = useState('');
    const [nameLoading, setNameLoading] = useState(false);

    const [picLoading, setPicLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [cropState, setCropState] = useState({ crop: { x: 0, y: 0 }, zoom: 1, aspect: 1 });
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [imageSelector, setImageSelector] = useState<{ url: string, filename: string } | null>(null);
    const [isCropping, setIsCropping] = useState(false);

    useEffect(() => {
        if (!isAuth && !userLoading) {
            router.push('/login');
        }
    }, [isAuth, router, userLoading]);

    useEffect(() => {
        if (user) {
            setName(user.name);
        }
    }, [user]);

    if (userLoading || !isAuth || !user) {
        return <Loading />;
    }

    const handleNameSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error("Name cannot be empty");
            return;
        }

        if (name === user.name) return;

        setNameLoading(true);
        try {
            const token = Cookies.get("token");
            const { data } = await axios.put(`${user_service}/api/v1/user/update`, { name }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            Cookies.set("token", data.token, { expires: 15, secure: false, path: '/' });
            setUser(data.user);
            toast.success(data.message || "Name updated successfully");
            
            if (socket) {
                socket.emit("profile_updated", { 
                    userId: data.user._id, 
                    name: data.user.name, 
                    profilePic: data.user.profilePic 
                });
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update name");
        } finally {
            setNameLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        setImageSelector({ url: URL.createObjectURL(file), filename: file.name });
        setIsCropping(true);
        
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const onCropComplete = (croppedArea: any, croppedPixels: any) => {
        setCroppedAreaPixels(croppedPixels);
    };

    const submitCroppedImage = async () => {
        if (!imageSelector || !croppedAreaPixels) return;

        setPicLoading(true);
        setIsCropping(false);
        
        try {
            const croppedBlob = await getCroppedImg(imageSelector.url, croppedAreaPixels, imageSelector.filename);
            
            const token = Cookies.get("token");
            const formData = new FormData();
            formData.append("profilePic", croppedBlob);

            const { data } = await axios.put(`${user_service}/api/v1/user/update/profile-pic`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            Cookies.set("token", data.token, { expires: 15, secure: false, path: '/' });
            setUser(data.user);
            toast.success(data.message || "Profile picture updated");
            
            if (socket) {
                socket.emit("profile_updated", { 
                    userId: data.user._id, 
                    name: data.user.name, 
                    profilePic: data.user.profilePic 
                });
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to upload image");
        } finally {
            setPicLoading(false);
            URL.revokeObjectURL(imageSelector.url);
            setImageSelector(null);
        }
    };

    const cancelCrop = () => {
        setIsCropping(false);
        if (imageSelector) URL.revokeObjectURL(imageSelector.url);
        setImageSelector(null);
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="bg-surface text-on-surface min-h-screen flex flex-col font-body">
            
            {isCropping && imageSelector && (
                <div className="fixed inset-0 z-50 bg-black/95 flex flex-col animate-in fade-in">
                    <div className="flex-1 relative">
                        <Cropper
                          image={imageSelector.url}
                          crop={cropState.crop}
                          zoom={cropState.zoom}
                          aspect={cropState.aspect}
                          cropShape="rect"
                          onCropChange={(crop) => setCropState(p => ({ ...p, crop }))}
                          onCropComplete={onCropComplete}
                          onZoomChange={(zoom) => setCropState(p => ({ ...p, zoom }))}
                        />
                    </div>
                    <div className="p-6 bg-surface-container flex flex-col items-center gap-5 border-t border-surface-container-highest">
                        <p className="text-on-surface-variant text-sm font-semibold">Drag to position. Pinch or scroll to zoom.</p>
                        <div className="flex justify-center gap-4 w-full max-w-sm">
                            <button onClick={cancelCrop} className="flex-1 py-3.5 rounded-xl font-bold text-on-surface bg-surface-container-highest hover:bg-surface-variant transition-colors cursor-pointer text-center">
                                Cancel
                            </button>
                            <button onClick={submitCroppedImage} className="flex-1 py-3.5 rounded-xl font-bold text-on-primary bg-primary shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer">
                                <Check className="w-5 h-5" /> Crop & Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <header className="px-6 py-4 border-b border-surface-container-highest flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/chat" className="flex items-center gap-2 px-4 py-2 bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant rounded-full text-sm font-semibold transition-colors text-on-surface cursor-pointer">
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Chat</span>
                    </Link>
                    <h1 className="text-2xl font-bold font-headline">Profile Settings</h1>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6 flex justify-center">
                <div className="w-full max-w-xl space-y-10">

                    <div className="bg-surface-container-low p-8 rounded-3xl border border-surface-container-highest shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-primary-container"></div>
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Camera className="w-5 h-5 text-primary" /> Profile Picture
                        </h2>

                        <div className="flex flex-col sm:flex-row items-center gap-8">
                            <div className="relative group cursor-pointer" onClick={triggerFileInput}>
                                <div className={`w-36 h-36 rounded-full overflow-hidden border-[6px] border-surface-container flex items-center justify-center bg-surface-variant shadow-md ${picLoading ? 'opacity-50' : ''}`}>
                                    {user.profilePic ? (
                                        <img src={user.profilePic} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-4xl text-on-surface-variant font-bold">
                                            {(user.name && user.name.length > 0) ? `${user.name.charAt(0).toUpperCase()}${user.name.charAt(user.name.length - 1).toUpperCase()}` : ''}
                                        </span>
                                    )}
                                </div>

                                {!picLoading && (
                                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Upload className="w-8 h-8 text-white" />
                                    </div>
                                )}

                                {picLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                    </div>
                                )}

                                <button className="absolute bottom-1 right-1 p-2 bg-primary text-on-primary rounded-full shadow-lg hover:bg-primary-block transition-colors">
                                    <Camera className="w-4 h-4" />
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>

                            <div className="flex-1 text-center sm:text-left">
                                <p className="text-on-surface font-semibold mb-1 text-lg">Avatar Details</p>
                                <p className="text-sm text-on-surface-variant leading-relaxed">Hover and click the image to upload a new profile picture. Supported formats: JPEG, PNG, or WebP. Max 5MB.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface-container-low p-8 rounded-3xl border border-surface-container-highest shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary to-tertiary"></div>
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <UserIcon className="w-5 h-5 text-secondary" /> Personal Details
                        </h2>

                        <form onSubmit={handleNameSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-semibold text-on-surface px-1">Display Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-5 py-3.5 bg-surface-container border border-outline-variant rounded-xl text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-base"
                                    placeholder="Your Name"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold px-1 text-on-surface-variant">Email Address</label>
                                <input
                                    type="email"
                                    value={user.email}
                                    className="w-full px-5 py-3.5 bg-surface-container-highest border-none rounded-xl text-on-surface-variant cursor-not-allowed opacity-70 text-base"
                                    disabled
                                />
                            </div>

                            <div className="pt-2 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={nameLoading || name === user.name || !name.trim()}
                                    className="flex items-center gap-2 px-8 py-3.5 bg-primary text-on-primary font-bold rounded-full shadow-md hover:bg-primary-block hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                                >
                                    {nameLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default ProfilePage;