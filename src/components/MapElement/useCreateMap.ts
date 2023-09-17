import { useEffect } from 'react';
import Map from '@arcgis/core/Map';
import SceneView from '@arcgis/core/views/SceneView';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import ElevationProfile from '@arcgis/core/widgets/ElevationProfile';
import { WLWB2023 } from '../../assets/wlwb 2023';
import ActionButton from '@arcgis/core/support/actions/ActionButton';
import { on } from '@arcgis/core/core/reactiveUtils';
import LayerList from '@arcgis/core/widgets/LayerList';
import Expand from '@arcgis/core/widgets/Expand';
import Graphic from '@arcgis/core/Graphic';
import Home from '@arcgis/core/widgets/Home';
import BasemapGallery from '@arcgis/core/widgets/BasemapGallery';
import Basemap from '@arcgis/core/Basemap';

export const useCreateMap = (mapRef: any) => {

    const map = new Map({
        basemap: 'hybrid',
        ground: 'world-elevation',
    });

    const blob = new Blob([JSON.stringify(WLWB2023)], {
        type: 'application/json',
    });
    const url = URL.createObjectURL(blob);

    const profileActionButton = new ActionButton({
        title: 'Profil wysokości',
        id: 'profile',
        icon: 'graph-time-series',
    });

    const layer = new GeoJSONLayer({
        id: 'wlwb_2023',
        title: '2023 Krasnystaw - Białystok',
        url,
        popupEnabled: true,
        popupTemplate:
            {
                title: '{name}',
                content: [{
                    type: 'text',
                    text: '{desc}',
                }],
                actions: [profileActionButton],
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

    useEffect(() => {
        let view: SceneView;
        (async (mapRef: any) => {
            map.add(layer);
            const view = new SceneView({
                viewingMode: 'local',
                container: mapRef.current,
                map: map,
                zoom: 6.7,
                center: [19, 52],
            });
            on(
                () => view.popup,
                'trigger-action',
                async (event) => {
                    if (event.action.id === 'profile') {
                        view.popup.close();
                        const features = await layer.queryFeatures();
                        const input = features.features[0] ?? null;
                        await showElevationProfile(view, input);
                    }
                });

            const homeBtn = new Home({
                view: view,
            });
            view.ui.add(homeBtn, 'top-right');

            const basemapGallery = new BasemapGallery({
                view: view,
                source: [Basemap.fromId('hybrid'), Basemap.fromId('topo-vector'), Basemap.fromId('streets')],
            });
            const baseLayersExpand = new Expand({
                expandIcon: 'layers',
                expandTooltip: 'Warstwy podkładowe',
                view: view,
                content: basemapGallery,
            });
            view.ui.add(baseLayersExpand, 'top-right');

            const layerList = new LayerList({
                container: document.createElement('div'),
                view: view,
            });
            const layerListExpand = new Expand({
                expandIcon: 'biking',
                expandTooltip: 'Wyprawy',
                view: view,
                content: layerList,
            });
            view.ui.add(layerListExpand, 'top-right');

            const elevationProfile = new ElevationProfile({
                id: 'tempProfile',
                view: view,
                profiles: [
                    {
                        type: 'ground',
                        color: 'red',
                    },
                ],
                visibleElements: {
                    legend: true,
                    clearButton: true,
                    settingsButton: false,
                    sketchButton: false,
                    selectButton: true,
                    uniformChartScalingToggle: true,
                },
            });
            const profileExpand = new Expand({
                expandIcon: 'graph-time-series',
                expandTooltip: 'Profil wysokości',
                view: view,
                content: elevationProfile,
            });
            view.ui.add(profileExpand, 'top-right');
            const showElevationProfile = async (view: SceneView, input: Graphic) => {
                elevationProfile.input = input;
                profileExpand.expanded = true;
            };

        })(mapRef);


        return () => view?.destroy();
    }, [mapRef]);
};
