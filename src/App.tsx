import React, { useState } from 'react';
import './App.css';
import { AppHeader } from './components/AppHeader/AppHeader';
import SceneView from '@arcgis/core/views/SceneView';
import MapElement from './components/MapElement/MapElement';

function App() {
    const [view, setView] = useState<SceneView | null>(null);

    return (
        <div className="App">
            <AppHeader view={view}>
                <MapElement setView={setView}/>
            </AppHeader>
        </div>
    );
}

export default App;
