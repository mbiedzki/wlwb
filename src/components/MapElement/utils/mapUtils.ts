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
 * Creates an Expand widget with legend content for a given SceneView.
 * @param {SceneView} view - The SceneView to be used for the widget.
 * @returns {Expand} - The Expand widget instance.
 */
export const getLegendExpand = (view: SceneView): Expand => new Expand({
    expandIcon: 'legend',
    expandTooltip: 'Legenda',
    view: view,
    content: getLegend(view),
});

/**
 * Creates a new legend for a given scene view.
 *
 * @param {SceneView} view - The scene view object to associate the legend with.
 * @returns {Legend} - The created legend object.
 */
export const getLegend = (view: SceneView): Legend => new Legend({
    view,
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
 * Creates an Expand widget for displaying an Elevation Profile in a specified SceneView.
 *
 * @param {SceneView} view - The SceneView in which the Elevation Profile will be displayed.
 * @param {ElevationProfile} elevationProfile - The Elevation Profile widget to be expanded.
 * @returns {Expand} An Expand widget configured with an elevation profile and relevant settings.
 */
export const getProfileExpand = (view: SceneView, elevationProfile: ElevationProfile): Expand => new Expand({
    expandIcon: 'graph-time-series',
    expandTooltip: 'Profil wysokości',
    view: view,
    content: elevationProfile,
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
 * Asynchronously displays an elevation profile for a given input graphic on a scene view.
 *
 * @param {Graphic} input - The graphic input for which the elevation profile will be generated.
 * @param {Expand} profileExpand - The UI component used to show the elevation profile.
 * @param {SceneView} view - The scene view where the graphic is displayed.
 * @param {ElevationProfile} elevationProfile - The elevation profile object that generates the profile.
 * @returns {Promise<void>} A promise that resolves when the elevation profile has been set and expanded.
 */
export const showElevationProfile = async (input: Graphic, profileExpand: Expand, view: SceneView,
                                           elevationProfile: ElevationProfile): Promise<void> => {
    const content = elevationProfile;
    content.set('input', input);
    profileExpand.content = content;
    profileExpand.expanded = true;
};


/**
 * Binds an event to the SceneView's popup trigger-action event that opens the elevation profile popup.
 * @param {SceneView} view - The SceneView object.
 * @param {GeoJSONLayer} layer - The GeoJSONLayer object.
 * @param {ElevationProfile} elevationProfile - The ElevationProfile object.
 * @param {Expand} profileExpand - The Expand object.
 * @returns {IHandle}
 */
export const setElevationProfilePopupEvent = (view: SceneView, layer: GeoJSONLayer, elevationProfile: ElevationProfile,
                                              profileExpand: Expand): IHandle => on(
    () => view.popup,
    'trigger-action',
    async (event) => {
        if (event.action.id === layer.id) {
            view.popup.close();
            const features = await layer.queryFeatures();
            const input = features.features[0];
            await showElevationProfile(input, profileExpand, view, elevationProfile);
        }
    });
