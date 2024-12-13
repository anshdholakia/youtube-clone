'use client';
import Image from "next/image";
import Link from "next/link";
import styles from "./navbar.module.css";
import SignIn from "./sign-in";
import { useEffect, useState } from "react";
import { onAuthStateChangedHelper } from "@/utils/firebase/firebase";
import { User } from "firebase/auth";

export default function Navbar(){
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => {
        const unsubscribe = onAuthStateChangedHelper((user) => {
            setUser(user);
        })
        return () => unsubscribe();
    }, [])
    return (
        <nav className={styles.nav}>
            <Link href="/">
                <Image width={110} height={30} src="/youtube-logo.svg.webp" alt="YouTube Logo"/>
            </Link>
            {
                // TODO: Add upload
            }
            <SignIn user={user} />
        </nav>
    );
}