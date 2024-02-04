import React, { useEffect } from 'react';
import SceneView from '@arcgis/core/views/SceneView';
import {
    getBaseMapsExpand,
    getElevationProfile,
    getHomeButton,
    getMap,
    getProfileExpand,
    getView,
    setElevationProfilePopupEvent,
} from './mapUtils';
import { getLayerListExpand, getLayers } from './layerUtils';


export const useCreateMap = (mapRef: React.MutableRefObject<HTMLDivElement | null>) => {

    const map = getMap();
    const layers = getLayers();

    useEffect(() => {
        let view: SceneView | undefined;
        const handles: IHandle[] = [];
        (async (mapRef: any) => {
            view = getView(map, mapRef);
            if (!view) return;

            const homeBtn = getHomeButton(view);
            view.ui.add(homeBtn, 'top-right');

            const baseLayersExpand = getBaseMapsExpand(view);
            view.ui.add(baseLayersExpand, 'top-right');

            const layerListExpand = getLayerListExpand(view);
            view.ui.add(layerListExpand, 'top-right');

            const elevationProfile = getElevationProfile(view);
            const profileExpand = getProfileExpand(view);
            view.ui.add(profileExpand, 'top-right');

            layers.forEach((layer) => {
                map.add(layer);
                if (view) handles.push(setElevationProfilePopupEvent(view, layer, elevationProfile, profileExpand));
            });

            return () => {
                view?.destroy();
                handles.forEach((handle) => handle.remove());
            };

        })(mapRef);

    }, [map, mapRef]);
};
