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
import React, { MutableRefObject } from 'react';

/**
 * Returns a new instance of Map, configured with the specified options.
 *
 * @function getMap
 * @returns {Map} A new Map instance.
 */
export const getMap = (): Map => new Map({
    basemap: 'topo-vector',
    ground: 'world-elevation',
});

/**
 * Creates and returns a new SceneView object.
 *
 * @param {Map} map - The map object to be displayed in the SceneView.
 * @param {React.MutableRefObject<HTMLDivElement | null>} mapRef - The mutable reference to the HTMLDivElement that
 *     will contain the SceneView.
 * @returns {SceneView | undefined} - The newly created SceneView object, or undefined if the mapRef is null or
 *     undefined.
 */
export const getView = (map: Map, mapRef: React.MutableRefObject<HTMLDivElement | null>): SceneView | undefined => {
    if (!mapRef.current) return;
    return new SceneView({
        viewingMode: 'local',
        container: mapRef.current,
        map: map,
        zoom: 6.7,
        center: [19, 52],
    });
};

/**
 * Adds an element to the user interface (UI) of a scene view.
 *
 * @param {SceneView} view - The scene view to add the element to.
 * @param {function} elementFunction - A function that returns the element to be added. This function should accept the
 *     scene view as a parameter and return the element.
 * @param {string} position - The position at which to add the element in the UI. Valid values are "top-left",
 *     "top-right", "bottom-left", and "bottom-right".
 */
export const addToUI = (view: SceneView, elementFunction: (view: SceneView) => any, position: string) => {
    const element = elementFunction(view);
    view.ui.add(element, position);
};

/**
 * Creates a home button for a scene view.
 *
 * @param {SceneView} view - The scene view to create the home button for.
 * @returns {Home} - The home button object.
 */
export const getHomeButton = (view: SceneView): Home => new Home({
    view,
});

/**
 * Creates a BasemapGallery object with the specified SceneView.
 * @param {SceneView} view - The SceneView object where the BasemapGallery will be added.
 * @returns {BasemapGallery} - The created BasemapGallery object.
 */
const getBasemapGallery = (view: SceneView): BasemapGallery => new BasemapGallery({
    view: view,
    source: [Basemap.fromId('topo-vector'), Basemap.fromId('hybrid'), Basemap.fromId('streets-vector')],
});

/**
 * The `getBaseMapsExpand` function creates an instance of the `Expand` widget with the given parameters.
 * It expands the basemap gallery when clicked.
 *
 * @param {SceneView} view - The SceneView instance where the basemap gallery will be expanded.
 * @returns {Expand} - The Expand widget instance.
 */
export const getBaseMapsExpand = (view: SceneView): Expand => new Expand({
    expandIcon: 'layers',
    expandTooltip: 'Warstwy podkładowe',
    view: view,
    content: getBasemapGallery(view),
});

/**
 * Creates an instance of the ElevationProfile class.
 *
 * @param {SceneView} view - The SceneView object to attach the elevation profile to.
 * @returns {ElevationProfile} - The created ElevationProfile instance.
 */
export const getElevationProfile = (view: SceneView): ElevationProfile => new ElevationProfile({
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

/**
 * Creates an Expand widget to display the elevation profile.
 *
 * @param {SceneView} view - The view in which the elevation profile widget will be expanded.
 * @param {MutableRefObject<ElevationProfile | undefined>} elevationProfileRef - A reference object to the elevation
 *     profile component.
 * @returns {Expand} The configured Expand widget containing the elevation profile.
 */
export const getProfileExpand = (view: SceneView,
                                 elevationProfileRef: MutableRefObject<ElevationProfile | undefined>): Expand => new Expand(
    {
        expandIcon: 'graph-time-series',
        expandTooltip: 'Profil wysokości',
        view: view,
        content: elevationProfileRef.current,
    });

/**
 * Creates a profile action button.
 *
 * @param {string} layerId - The ID of the layer.
 * @returns {ActionButton} - The profile action button object.
 */
export const getProfileActionButton = (layerId: string): ActionButton => new ActionButton({
    title: 'Profil wysokości',
    id: layerId,
    icon: 'graph-time-series',
});

/**
 * Displays the elevation profile for a given graphic input on a scene view.
 *
 * @param {Graphic} input - The graphic input for which the elevation profile will be displayed.
 * @param {Expand} profileExpand - The expand widget that will contain the elevation profile content.
 * @param {SceneView} view - The scene view where the elevation profile will be shown.
 * @param {MutableRefObject<ElevationProfile | undefined>} elevationProfileRef - A reference object for the elevation
 *     profile component.
 *
 * @returns {Promise<void>} A promise that resolves once the elevation profile is successfully displayed.
 */
export const showElevationProfile = async (input: Graphic, profileExpand: Expand, view: SceneView,
                                           elevationProfileRef: MutableRefObject<ElevationProfile | undefined>): Promise<void> => {
    const content = elevationProfileRef.current;
    if (content) {
        content.set('input', null);
        content.set('input', input);
        profileExpand.content = content;
        profileExpand.expanded = true;
    }
};


/**
 * Registers an event handler to display the elevation profile popup for a given GeoJSON layer on a SceneView.
 *
 * @param {SceneView} view - The SceneView instance on which the popup event is set.
 * @param {GeoJSONLayer} layer - The GeoJSONLayer for which the elevation profile is to be displayed.
 * @param {MutableRefObject<ElevationProfile | undefined>} elevationProfileRef - A reference to the ElevationProfile
 *     component.
 * @param {Expand} profileExpand - The Expand instance that manages the display of the ElevationProfile.
 * @returns {IHandle} - A handle to the registered event, allowing removal or other event management operations.
 */
export const setElevationProfilePopupEvent = (view: SceneView, layer: GeoJSONLayer,
                                              elevationProfileRef: MutableRefObject<ElevationProfile | undefined>,
                                              profileExpand: Expand): IHandle => on(
    () => view.popup,
    'trigger-action',
    async (event) => {
        if (event.action.id === layer.id) {
            view.popup.close();
            const features = await layer.queryFeatures();
            const input = features.features[0];
            await showElevationProfile(input, profileExpand, view, elevationProfileRef);
        }
    });
