import Map from '@arcgis/core/Map';
import ActionButton from '@arcgis/core/support/actions/ActionButton';
import ElevationProfile from '@arcgis/core/widgets/ElevationProfile';
import SceneView from '@arcgis/core/views/SceneView';
import Expand from '@arcgis/core/widgets/Expand';
import Graphic from '@arcgis/core/Graphic';
import LayerList from '@arcgis/core/widgets/LayerList';
import BasemapGallery from '@arcgis/core/widgets/BasemapGallery';
import Basemap from '@arcgis/core/Basemap';
import Home from '@arcgis/core/widgets/Home';
import { on } from '@arcgis/core/core/reactiveUtils';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import React from 'react';

export const getMap = () => new Map({
    basemap: 'hybrid',
    ground: 'world-elevation',
});

export const getView = (map: Map, mapRef: React.MutableRefObject<HTMLDivElement | null>) => {
    if (!mapRef.current) return;
    return new SceneView({
        viewingMode: 'local',
        container: mapRef.current,
        map: map,
        zoom: 6.7,
        center: [19, 52],
    });
};

export const getHomeButton = (view: SceneView) => new Home({
    view,
});

const getBasemapGallery = (view: SceneView) => new BasemapGallery({
    view: view,
    source: [Basemap.fromId('hybrid'), Basemap.fromId('topo-vector'), Basemap.fromId('streets-vector')],
});

export const getBaseMapsExpand = (view: SceneView) => new Expand({
    expandIcon: 'layers',
    expandTooltip: 'Warstwy podkładowe',
    view: view,
    content: getBasemapGallery(view),
});

export const getElevationProfile = (view: SceneView) => new ElevationProfile({
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

export const getProfileExpand = (view: SceneView) => new Expand({
    expandIcon: 'graph-time-series',
    expandTooltip: 'Profil wysokości',
    view: view,
    content: getElevationProfile(view),
});

export const getProfileActionButton = () => new ActionButton({
    title: 'Profil wysokości',
    id: 'profile',
    icon: 'graph-time-series',
});

export const showElevationProfile = async (input: Graphic, view: SceneView, elevationProfile: ElevationProfile,
                                           profileExpand: Expand) => {
    elevationProfile.input = input;
    profileExpand.expanded = true;
};

const getLayerList = (view: SceneView) => new LayerList({
    container: document.createElement('div'),
    view: view,
});

export const getLayerListExpand = (view: SceneView) =>
    new Expand({
        expandIcon: 'biking',
        expandTooltip: 'Wyprawy',
        view: view,
        content: getLayerList(view),
    });

export const setElevationProfilePopupEvent = (view: SceneView, layer: GeoJSONLayer, elevationProfile: ElevationProfile,
                                              profileExpand: Expand) => on(
    () => view.popup,
    'trigger-action',
    async (event) => {
        if (event.action.id === 'profile') {
            view.popup.close();
            const features = await layer.queryFeatures();
            const input = features.features[0] ?? null;
            await showElevationProfile(input, view, elevationProfile, profileExpand);
        }
    });
