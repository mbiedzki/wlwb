import React, { useEffect } from 'react';
import SceneView from '@arcgis/core/views/SceneView';
import {
    addToUI,
    getBaseMapsExpand,
    getElevationProfile,
    getHomeButton,
    getLegendExpand,
    getMap,
    getProfileExpand,
    getView,
    setElevationProfilePopupEvent,
} from '../utils/mapUtils';
import { getLayerListExpand, getLayers } from '../utils/layerUtils';


/**
 * Sets up a map with specified layers and UI components using a given mapRef.
 *
 * @param {React.MutableRefObject<HTMLDivElement | null>} mapRef - The reference to the HTML div element where the map
 *     will be rendered.
 * @returns {void}
 */
export const useCreateMap = (mapRef: React.MutableRefObject<HTMLDivElement | null>) => {

    const map = getMap();
    const layers = getLayers();

    useEffect(() => {
        let view: SceneView | undefined;
        const handles: IHandle[] = [];
        (async (mapRef: any) => {
            view = getView(map, mapRef);
            if (!view) return;

            addToUI(view, getHomeButton, 'top-right');
            addToUI(view, getBaseMapsExpand, 'top-right');
            addToUI(view, getLegendExpand, 'top-right');
            addToUI(view, getLayerListExpand, 'top-right');

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

    }, [map, mapRef, layers]);
};
