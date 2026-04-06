"use client"

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";

export const user_service = "http://localhost:8080";
export const chat_service = "http://localhost:5002";

export interface User {
    _id: string;
    name: string;
    email: string;
    profilePic: string;
}

export interface Chat {
    _id: string;
    users: string[];
    lastMessage: {
        type: string,
        sender: string
    };
    createdAt: string;
    updatedAt: string;
    unseenCount: number;
}

export interface Chats {
    _id: string;
    user: User;
    chat: Chat;
}

interface AppContextType {
    user: User | null;
    userLoading: boolean;
    isAuth: boolean;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
    logoutUser: () => Promise<void>;
    chats: Chats[] | null;
    setChats: React.Dispatch<React.SetStateAction<Chats[] | null>>;
    fetchChats: () => Promise<void>;
    users: User[] | null;
    fetchUsers: () => Promise<void>;
}

const AppContext = React.createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
    children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    const [user, setUser] = React.useState<User | null>(null);
    const [isAuth, setIsAuth] = React.useState<boolean>(false);
    const [userLoading, setUserLoading] = React.useState<boolean>(true);

    async function fetchUser() {
        try {
            const token = Cookies.get("token");
            if (!token) {
                setIsAuth(false);
                setUserLoading(false);
                return;
            }
            const { data } = await axios.get(`${user_service}/api/v1/me`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (data.user) {
                setUser(data.user);
                setIsAuth(true);
                setUserLoading(false);
            }
        } catch (error) {
            console.error(error);
            setUserLoading(false);
        }
    }

    async function logoutUser() {
        Cookies.remove("token");
        setUser(null);
        setIsAuth(false);
    }

    const [chats, setChats] = useState<Chats[] | null>(null);

    async function fetchChats() {
        const token = Cookies.get("token");
        try {
            const { data } = await axios.get(`${chat_service}/api/v1/chat/all`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (data.chats) {
                setChats(data.chats);
            }
        } catch (error) {
            console.error(error);
        }
    }

    const [users, setUsers] = useState<User[] | null>(null);

    async function fetchUsers() {
        const token = Cookies.get("token");
        try {
            const { data } = await axios.get(`${user_service}/api/v1/user/all`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (data.users) {
                setUsers(data.users);
            }
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        fetchUser();
        fetchChats();
        fetchUsers();
    }, []);

    return (
        <AppContext.Provider value={{ user, userLoading, isAuth, setUser, setIsAuth, logoutUser, chats, setChats, fetchChats, users, fetchUsers }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppData = (): AppContextType => {
    const context = React.useContext(AppContext);
    if (!context) {
        throw new Error("useAppData must be used within AppProvider");
    }
    return context;
};