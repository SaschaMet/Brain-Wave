"use client"
import React, { useState } from 'react';


const Navbar = () => {
    const [isNavbarOpen, setIsNavbarOpen] = useState(false);

    const toggleNavbar = () => {
        setIsNavbarOpen(!isNavbarOpen);
    };

    return (
        <nav className={`navbar navbar-expand-md ${isNavbarOpen ? 'navbar-open' : ''}`}>
            <div className="container-xl">
                <button className="navbar-toggler" type="button" onClick={toggleNavbar}>
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className={`collapse navbar-collapse ${isNavbarOpen ? 'show' : ''}`}>
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-1 ms-md-0">
                        <li className="nav-item">
                            <a className="nav-link" href="/">Home</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="/statistics">Statistics</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="/edit">Edit Questions</a>
                        </li>

                    </ul>
                    <a href="/insert" className="btn btn-outline-secondary ms-1 ms-md-0">Add New Question</a>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
