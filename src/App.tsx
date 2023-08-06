import React from 'react';
import './App.css';
import MapElement from './components/MapElement/MapElement';
import { AppHeader } from './components/AppHeader/AppHeader';

function App() {
    return <div className="App">
        <AppHeader/>
        <MapElement/>
    </div>;
}

export default App;
