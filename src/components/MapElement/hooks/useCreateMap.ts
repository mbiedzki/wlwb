import { MutableRefObject, useEffect, useRef } from 'react';
import SceneView from '@arcgis/core/views/SceneView';
import {
    addToUI,
    getBaseMapsExpand,
    getElevationProfile,
    getHomeButton,
    getMap,
    getProfileExpand,
    getView,
    setElevationProfilePopupEvent,
} from '../utils/mapUtils';
import { getLayerListExpand, getLayers } from '../utils/layerUtils';
import ElevationProfile from '@arcgis/core/widgets/ElevationProfile';


/**
 * Sets up a map with specified layers and UI components using a given mapRef.
 *
 * @param {MutableRefObject<HTMLDivElement | null>} mapRef - The reference to the HTML div element where the map
 *     will be rendered.
 * @returns {void}
 */
export const useCreateMap = (mapRef: MutableRefObject<HTMLDivElement | null>): void => {

    const map = useRef(getMap());
    const layers = useRef(getLayers());
    const highlightedFeatureRef = useRef<__esri.Handle>();
    const elevationProfileRef = useRef<ElevationProfile>();

    useEffect(() => {
        let view: SceneView | undefined;
        const handles: IHandle[] = [];
        (async (mapRef: any) => {
            view = getView(map.current, mapRef);
            if (!view) return;

            addToUI(view, getHomeButton, 'top-right');
            addToUI(view, getBaseMapsExpand, 'top-right');

            const layerListExpand = getLayerListExpand(view, highlightedFeatureRef, elevationProfileRef);
            view.ui.add(layerListExpand, 'top-right');

            elevationProfileRef.current = getElevationProfile(view);
            const profileExpand = getProfileExpand(view, elevationProfileRef);
            view.ui.add(profileExpand, 'top-right');

            view.on('layerview-create-error', (event) => {
                const { id } = event.layer;
                if (id) {
                    console.error('WLWB failed to load layer:', event.layer.id);
                    alert(`Problem z załadowaniem warstwy: ${event.layer.id}`);
                }
            });

            view.on('click', (event) => {
                if (elevationProfileRef.current) (elevationProfileRef.current.input as any) = null;
                highlightedFeatureRef.current?.remove();
            });

            layers.current.forEach((layer) => {
                map.current.add(layer);
                if (view) handles.push(setElevationProfilePopupEvent(view, layer, elevationProfileRef, profileExpand));
            });

            return () => {
                view?.destroy();
                handles.forEach((handle) => handle.remove());
            };

        })(mapRef);

    }, [map, mapRef, layers]);
};
