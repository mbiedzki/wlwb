import { getProfileActionButton } from './mapUtils';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import SceneView from '@arcgis/core/views/SceneView';
import LayerList from '@arcgis/core/widgets/LayerList';
import Expand from '@arcgis/core/widgets/Expand';
import { getRandomColor } from '../../../services/utils';
import { layerConfig } from '../config/layerConfig';
import { LayerProps } from '../types';
import ActionButton from '@arcgis/core/support/actions/ActionButton';
import { MutableRefObject } from 'react';
import ElevationProfile from '@arcgis/core/widgets/ElevationProfile';


/**
 * Creates a renderer object for displaying a line symbol on a map.
 *
 * @param {number} numOfSteps - The total number of steps.
 * @param {number} step - The current step.
 * @returns {Object} The renderer object.
 */
const createRendererObj = (numOfSteps: number, step: number): object => ({
    type: 'simple',
    symbol: {
        type: 'simple-line',
        width: 3,
        style: 'solid',
        color: getRandomColor(numOfSteps, step),
    },
});

/**
 * Function to create a point renderer object.
 *
 * @returns {object} - The point renderer object.
 */
const createPointRendererObj = (): object => ({
    type: 'simple',
    symbol: {
        type: 'simple-marker',
        size: '10px',
        style: 'circle',
        color: 'white',
        outline: {
            color: 'green',
            width: 2,  // points
        },
    },
});

/**
 * Creates a GeoJSON layer with the given configuration, action button, and renderer object.
 *
 * @param {LayerProps} config - The configuration object for the layer.
 * @param {ActionButton} actionButton - The action button for the layer.
 * @param {any} rendererObj - The renderer object for the layer.
 * @returns {GeoJSONLayer} - The created GeoJSON layer.
 */
const createLayer = (config: LayerProps, actionButton: ActionButton, rendererObj: any): GeoJSONLayer => {
    const layer = createGeoJSONLayer(config, actionButton);
    (layer as any).renderer = rendererObj;

    return layer;
};


/**
 * Retrieves a list of GeoJSON layers based on the layer configuration.
 *
 * @return {Array<GeoJSONLayer>} An array of GeoJSON layers.
 */
export const getLayers = (): Array<GeoJSONLayer> => {
    return layerConfig.map((config, index) => {
        const isPointGeometry = config.id === 'miasta';
        const actionButton = getProfileActionButton(config.id);
        const rendererObj = isPointGeometry ? createPointRendererObj() : createRendererObj(layerConfig.length, index);
        return createLayer(config, actionButton, rendererObj);
    });
};

/**
 * Creates a GeoJSONLayer with specified configurations and an action button for the popup.
 *
 * @param {LayerProps} config - Configuration object for the layer, including id, title, description, and URL.
 * @param {Object} layerProfileActionButton - Action button to be added to the popup template.
 * @returns {GeoJSONLayer} - A configured instance of GeoJSONLayer.
 *
 * @typedef {Object} LayerProps
 * @property {string} id - The identifier for the GeoJSONLayer.
 * @property {string} title - The title for the GeoJSONLayer.
 * @property {string} desc - The description to be displayed in the popup.
 * @property {string} url - The URL to the GeoJSON data.
 */
const createGeoJSONLayer = (config: LayerProps, layerProfileActionButton: any): GeoJSONLayer => {
    const {
        id,
        title,
        desc,
        url,
    } = config;

    const isPointGeometry = id === 'miasta';

    const linePopupTemplate = {
        title,
        content: [{
            type: 'text',
            text: desc,
        }],
        actions: [layerProfileActionButton],
    };

    const pointPopupTemplate = {
        title,
        content: '{expression/desc}',
        expressionInfos: [{
            name: 'desc',
            expression: '$feature.cmt',
        }],
    };

    return new GeoJSONLayer({
        id,
        title,
        url,
        popupEnabled: true,
        popupTemplate: isPointGeometry ? pointPopupTemplate : linePopupTemplate,
        elevationInfo: {
            mode: 'relative-to-ground',
            offset: isPointGeometry ? 60 : 50, // Elevation offset in meters
        },
        labelingInfo: isPointGeometry ? [{
            symbol: {
                type: 'text',
                color: 'green',
                haloColor: 'green',
                haloSize: 0,
                font: {
                    family: 'Ubuntu Mono',
                    size: 10,
                    weight: 'bold',
                },
            },
            labelPlacement: 'above-right',
            labelExpressionInfo: {
                expression: '$feature.name',
            },
        }] : undefined,
    });
};

/**
 * Handles the action to zoom the view to the full extent of a GeoJSONLayer.
 * @param {GeoJSONLayer} layer - The GeoJSON layer to zoom to the full extent of.
 * @param {SceneView} view - The scene view to apply the zoom action to.
 * @returns {Promise<void>} - A promise that resolves once the view has been zoomed to the full extent.
 */
const handleFullExtentAction = async (layer: GeoJSONLayer, view: SceneView): Promise<void> => {
    await view.goTo(layer.fullExtent);
};

/**
 * Handles the selection action on a GeoJSON layer within a SceneView.
 *
 * This function performs the following tasks:
 * 1. Removes any existing highlight on a feature if present.
 * 2. Clears the input of the elevation profile if it exists.
 * 3. Queries the GeoJSON layer for features.
 * 4. Highlights the first feature from the queried results on the layer view.
 *
 * @param {GeoJSONLayer} layer - The layer from which features will be queried.
 * @param {SceneView} view - The SceneView instance where the layer is rendered.
 * @param {MutableRefObject<__esri.Handle | undefined>} highlightedFeatureRef - A reference object to store the handle
 *     of the currently highlighted feature.
 * @param {MutableRefObject<ElevationProfile | undefined>} elevationProfileRef - A reference object to manage the
 *     elevation profile input.
 * @returns {Promise<void>} - A promise that resolves when the selection action is complete.
 */
const handleSelectAction = async (layer: GeoJSONLayer, view: SceneView,
                                  highlightedFeatureRef: MutableRefObject<__esri.Handle | undefined>,
                                  elevationProfileRef: MutableRefObject<ElevationProfile | undefined>): Promise<void> => {
    if (highlightedFeatureRef.current) highlightedFeatureRef.current.remove();
    if (elevationProfileRef.current) (elevationProfileRef.current as any).input = null;
    const queriedFeatures = await layer.queryFeatures();
    const firstFeature = queriedFeatures.features[0];
    const layerView = await view.whenLayerView(layer);
    highlightedFeatureRef.current = layerView.highlight(firstFeature);
};

/**
 * Performs the action to deselect features and clear elevation profile.
 *
 * This function removes the highlighted feature and clears the input of the elevation profile.
 *
 * @param {MutableRefObject<__esri.Handle | undefined>} highlightedFeatureRef - Reference to the currently highlighted
 *     feature.
 * @param {MutableRefObject<ElevationProfile | undefined>} elevationProfileRef - Reference to the elevation profile
 *     component.
 */
const handleDeselectAction = (highlightedFeatureRef: MutableRefObject<__esri.Handle | undefined>,
                              elevationProfileRef: MutableRefObject<ElevationProfile | undefined>) => {
    if (highlightedFeatureRef.current) highlightedFeatureRef.current.remove();
    if (elevationProfileRef.current) (elevationProfileRef.current as any).input = null;
};

/**
 * Handles various actions based on the provided action ID. This function performs specific tasks on
 * a GeoJSON layer within a SceneView, such as zooming to the full extent, selecting a feature, or
 * deselecting a feature. It utilizes references for highlighted features and elevation profiles.
 *
 * @param {string} actionId - The identifier of the action to be performed. Supported action IDs are:
 *  'full-extent', 'select', and 'deselect'.
 * @param {GeoJSONLayer} layer - The GeoJSON layer on which the action will be performed.
 * @param {SceneView} view - The SceneView in which the layer is displayed.
 * @param {MutableRefObject<__esri.Handle|undefined>} highlightedFeatureRef - A reference object that holds
 *  a handle to the currently highlighted feature, if any.
 * @param {MutableRefObject<ElevationProfile|undefined>} elevationProfileRef - A reference object that holds
 *  the elevation profile associated with the highlighted feature, if any.
 * @returns {Promise<__esri.Handle|void>} A promise that resolves to a handle if an action returns a handle,
 * or void otherwise.
 */
const handleAction = async (actionId: string, layer: GeoJSONLayer, view: SceneView,
                            highlightedFeatureRef: MutableRefObject<__esri.Handle | undefined>,
                            elevationProfileRef: MutableRefObject<ElevationProfile | undefined>): Promise<__esri.Handle | void> => {
    switch (actionId) {
        case 'full-extent':
            await handleFullExtentAction(layer, view);
            break;
        case 'select':
            await handleSelectAction(layer, view, highlightedFeatureRef, elevationProfileRef);
            break;
        case 'deselect':
            handleDeselectAction(highlightedFeatureRef, elevationProfileRef);
            break;
        default:
            break;
    }
};

/**
 * Constructs and returns a configured LayerList widget for a given SceneView.
 *
 * @param {SceneView} view - The SceneView instance for which the LayerList is created.
 * @param {MutableRefObject<__esri.Handle | undefined>} highlightedFeatureRef - Reference object for managing
 *     highlighted features.
 * @param {MutableRefObject<ElevationProfile | undefined>} elevationProfileRef - Reference object for managing the
 *     elevation profile.
 * @returns {LayerList} - The configured LayerList widget.
 *
 * The returned LayerList contains a list of layers associated with the specified SceneView. The list includes actions
 * defined in the `defineLayerListActions` function, and handles triggered actions through an asynchronous event
 *     handler.
 */
const getLayerList = (view: SceneView,
                      highlightedFeatureRef: MutableRefObject<__esri.Handle | undefined>,
                      elevationProfileRef: MutableRefObject<ElevationProfile | undefined>): LayerList => {
    const layerList = new LayerList({
        container: document.createElement('div'),
        view: view,
        listItemCreatedFunction: defineLayerListItem,
    });

    layerList.on('trigger-action', async (event) => {
        const actionId = event.action.id;
        const layer = event.item.layer as GeoJSONLayer;
        await handleAction(actionId, layer, view, highlightedFeatureRef, elevationProfileRef);
    });

    return layerList;
};

/**
 * Creates an Expand widget to display a layer list within a SceneView.
 *
 * @param {SceneView} view - The view in which the layer list will be displayed.
 * @param {MutableRefObject<__esri.Handle | undefined>} highlightedFeatureRef - Reference to the currently highlighted
 *     feature.
 * @param {MutableRefObject<ElevationProfile | undefined>} elevationProfileRef - Reference to the elevation profile.
 * @returns {Expand} - An expandable widget containing the layer list.
 */
export const getLayerListExpand = (view: SceneView,
                                   highlightedFeatureRef: MutableRefObject<__esri.Handle | undefined>,
                                   elevationProfileRef: MutableRefObject<ElevationProfile | undefined>): Expand =>
    new Expand({
        expandIcon: 'biking',
        expandTooltip: 'Wyprawy',
        view: view,
        content: getLayerList(view, highlightedFeatureRef, elevationProfileRef),
    });

/**
 * Creates an array of actions.
 * Each action object contains a title, className, and id.
 *
 * @returns {Array} An array of action objects.
 */
const createActions = (): Array<any> => {
    return [
        {
            title: 'Przybliż do trasy',
            className: 'esri-icon-zoom-out-fixed',
            id: 'full-extent',
        },
        {
            title: 'Zaznacz',
            className: 'esri-icon-checkbox-checked',
            id: 'select',
        },
        {
            title: 'Odznacz',
            className: 'esri-icon-checkbox-unchecked',
            id: 'deselect',
        },
    ];
};

/**
 * Asynchronously defines layer list actions for a given event item.
 *
 * @param {Object} event - The event object containing the item.
 * @param {any} event.item - The item for which to define layer list actions.
 */
export const defineLayerListItem = async (event: { item: any; }) => {
    const item = event.item;
    await item.layer.when();
    item.actionsSections = [createActions()];
    item.panel = {
        content: 'legend',
    };
};
