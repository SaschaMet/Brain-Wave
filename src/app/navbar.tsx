"use client"
import React, { useState } from 'react';


const Navbar = () => {
    const [isNavbarOpen, setIsNavbarOpen] = useState(false);

    const toggleNavbar = () => {
        setIsNavbarOpen(!isNavbarOpen);
    };

    return (
        <nav className={`navbar navbar-expand-md ${isNavbarOpen ? 'navbar-open' : ''} mb-3 mb-sm-0`}>
            <div className="container-xl">
                <a href='/' title='home' className='no-underline navbar-back-link'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-arrow-left" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M6.354 11.354a.5.5 0 0 1 0-.708L2.707 8l3.647-3.646a.5.5 0 0 1 .708.708L4.707 8l2.645 2.646a.5.5 0 0 1-.708.708z" />
                        <path fillRule="evenodd" d="M2.5 8a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1h-10a.5.5 0 0 1-.5-.5z" />
                    </svg>
                </a>
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
