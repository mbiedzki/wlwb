import { useEffect } from 'react';
import Map from '@arcgis/core/Map';
import SceneView from '@arcgis/core/views/SceneView';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import { WLWB2023 } from '../../assets/wlwb 2023';

export const useCreateMap = (mapRef: any) => {
    useEffect(() => {
        let view: SceneView;
        (async (mapRef: any) => {
            const map = new Map({
                basemap: 'hybrid',
                ground: 'world-elevation',
            });
            view = new SceneView({
                viewingMode: 'local',
                container: mapRef.current,
                map: map,
                zoom: 6.7,
                center: [19, 52],
            });
            const blob = new Blob([JSON.stringify(WLWB2023)], {
                type: 'application/json',
            });
            const url = URL.createObjectURL(blob);
            const layer = new GeoJSONLayer({
                url,
                popupEnabled: true,
                popupTemplate:
                    {
                        title: '{name}',
                        content: [{
                            type: 'text',
                            text: '{desc}',
                        }],
                    },
            });
            (layer as any).renderer = {
                type: 'simple',
                symbol: {
                    type: 'simple-line',
                    width: 3,
                    style: 'solid',
                    color: 'red',
                },
            };
            map.add(layer);
        })(mapRef);

        return () => view?.destroy();
    }, [mapRef]);
};
