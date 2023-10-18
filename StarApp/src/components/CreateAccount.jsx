import React, { useState } from 'react';
import axios from 'axios';

export default function CreateAccount({ closeWin, setMessage, setShowToast }) {
    const [isLoading, setIsLoading] = useState(false);
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        password: '',
        designation: '',
    });

    function handleChange(e) {
        const { name, value } = e.target;
        setUserData({ ...userData, [name]: value });
    }

    function handleSubmit(e) {
        e.preventDefault();
        setIsLoading(true);

        axios({
            method: "post",
            url: "http://localhost:4000/user/signup",
            data: userData,
        })
            .then((response) => {
                setMessage(response.data.message);
                setShowToast(true);
                closeWin()
                setIsLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setIsLoading(false);
            });
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                        className="form-control"
                        name="name"
                        value={userData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={userData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        name="password"
                        value={userData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Designation</label>
                    <input
                        type="text"
                        className="form-control"
                        name="designation"
                        value={userData.designation}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-outline-primary">
                    Sign Up
                </button>
            </form>
        </div>
    );
}
