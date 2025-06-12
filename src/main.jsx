// this file, main.jsx is the entry point of the React application.
import React from 'react';
//ReactDOM is used to render the React application into the DOM.
import ReactDOM from 'react-dom/client';
// BrowserRouter is used to enable routing in the React application.
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

//this initializes the React application and renders it into the root element 
// of the HTML document.
ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        {/**this tag is used to enable routing in out react app */}
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>
);