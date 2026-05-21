import React, { useEffect, useState } from 'react';
import './App.css';
import { AppHeader } from './components/AppHeader/AppHeader';
import SceneView from '@arcgis/core/views/SceneView';
import MapElement from './components/MapElement/MapElement';
import { HoverPopupDialog } from './components/CustomDialogs/HoverPopupDialog';
import { enableHoverPopups, HoverHitInfo } from './components/MapElement/utils/popupUtils';

function App() {
    const [view, setView] = useState<SceneView | null>(null);
    const [hit, setHit] = useState<HoverHitInfo | null>(null);

    useEffect(() => {
        if (!view) return;
        const handle = enableHoverPopups(view, { onHit: setHit });
        return () => handle.remove();
    }, [view]);

    return (
        <div className="App">
            <AppHeader view={view}>
                <MapElement setView={setView} />
                <HoverPopupDialog hit={hit} />
            </AppHeader>
        </div>
    );
}

export default App;
