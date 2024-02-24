import Map from '@arcgis/core/Map';
import ActionButton from '@arcgis/core/support/actions/ActionButton';
import ElevationProfile from '@arcgis/core/widgets/ElevationProfile';
import SceneView from '@arcgis/core/views/SceneView';
import Expand from '@arcgis/core/widgets/Expand';
import Graphic from '@arcgis/core/Graphic';
import BasemapGallery from '@arcgis/core/widgets/BasemapGallery';
import Basemap from '@arcgis/core/Basemap';
import Home from '@arcgis/core/widgets/Home';
import { on } from '@arcgis/core/core/reactiveUtils';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import React from 'react';
import Legend from '@arcgis/core/widgets/Legend';

export const getMap = () => new Map({
    basemap: 'topo-vector',
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

export const addToUI = (view: SceneView, elementFunction: (view: SceneView) => any, position: string) => {
    const element = elementFunction(view);
    view.ui.add(element, position);
};

export const getHomeButton = (view: SceneView) => new Home({
    view,
});

const getBasemapGallery = (view: SceneView) => new BasemapGallery({
    view: view,
    source: [Basemap.fromId('topo-vector'), Basemap.fromId('hybrid'), Basemap.fromId('streets-vector')],
});

export const getBaseMapsExpand = (view: SceneView) => new Expand({
    expandIcon: 'layers',
    expandTooltip: 'Warstwy podkładowe',
    view: view,
    content: getBasemapGallery(view),
});

export const getLegendExpand = (view: SceneView) => new Expand({
    expandIcon: 'legend',
    expandTooltip: 'Legenda',
    view: view,
    content: getLegend(view),
});

export const getLegend = (view: SceneView) => new Legend({
    view,
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

export const getProfileActionButton = (layerId: string) => new ActionButton({
    title: 'Profil wysokości',
    id: layerId,
    icon: 'graph-time-series',
});

export const showElevationProfile = async (input: Graphic, profileExpand: Expand, view: SceneView) => {
    const content = getElevationProfile(view);
    content.set('input', input);
    profileExpand.content = content;
    profileExpand.expanded = true;
};


export const setElevationProfilePopupEvent = (view: SceneView, layer: GeoJSONLayer, elevationProfile: ElevationProfile,
                                              profileExpand: Expand) => on(
    () => view.popup,
    'trigger-action',
    async (event) => {
        if (event.action.id === layer.id) {
            view.popup.close();
            const features = await layer.queryFeatures();
            const input = features.features[0];
            await showElevationProfile(input, profileExpand, view);
        }
    });
