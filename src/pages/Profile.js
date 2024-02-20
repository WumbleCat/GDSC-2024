import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { initializeApp } from 'firebase/app'; // Import initializeApp
import { getAuth, GoogleAuthProvider, signOut } from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig); // Initialize Firebase app
const auth = getAuth(app);

export default function Profile() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [description, setDescription] = useState('');

    const handleSignOut = () => {
        signOut(auth)
            .then(() => {
                console.log("User has logged out.")
                navigate("/");
            })
            .catch((error) => {
                console.error("Error signing out:", error);
            })
    }


    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const checkResponse = await fetch(`http://localhost:3001/profile/${username}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (checkResponse.ok) {
                const existingProfile = await checkResponse.json();
                const method = existingProfile ? 'PUT' : 'POST'; // Determine the HTTP method based on whether the profile exists
                const url = existingProfile ? `http://localhost:3001/profile/${username}` : 'http://localhost:3001/profile';

                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, description })
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('User updated/created:', data);
                } else {
                    throw new Error('Failed to update/create user');
                }
            } else {
                throw new Error('Failed to check profile existence');
            }

            // Clear
            setUsername('');
            setDescription('');
        } catch (error) {
            console.error('Error creating/updating user:', error);
        }
    };



    return (
        <>
            <h1>Profile</h1>
            <button className="btn btn-primary" onClick={handleSignOut}>Logout</button>
            <Link to='/'>Return to home</Link>
            <div>
                <form onSubmit={handleSubmit}>
                    <input type='text' id='username' placeholder="username" onChange={(e) => setUsername(e.target.value)} value={username} required></input>
                    <input type='text' id='description' placeholder="about me (max: 1000 chars)" onChange={(e) => setDescription(e.target.value)} value={description} required></input>
                    <button type="submit" className="btn btn-primary">Save</button>
                </form>
            </div>
        </>
    )
}