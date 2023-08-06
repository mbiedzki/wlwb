import { useEffect } from 'react';
import Map from '@arcgis/core/Map';
import SceneView from '@arcgis/core/views/SceneView';

export const useCreateMap = (mapRef: any) => {
    useEffect(() => {
        let view: SceneView;
        (async (mapRef: any) => {
            const map = new Map({ basemap: 'hybrid', ground: 'world-elevation' });
            view = new SceneView({
                viewingMode: 'local',
                container: mapRef.current,
                map: map,
                zoom: 7,
                center: [19, 52],
            });
        })(mapRef);
        return () => view?.destroy();
    }, [mapRef]);
};
