import { getProfileActionButton } from './mapUtils';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import SceneView from '@arcgis/core/views/SceneView';
import LayerList from '@arcgis/core/widgets/LayerList';
import Expand from '@arcgis/core/widgets/Expand';
import { getRandomColor } from '../../../services/utils';
import { layerConfig } from '../config/layerConfig';
import { LayerProps } from '../types';
import ActionButton from '@arcgis/core/support/actions/ActionButton';


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
 * Creates a GeoJSONLayer with provided configuration, action button, and renderer object.
 *
 * @param {LayerProps} config - The configuration for the layer.
 * @param {ActionButton} actionButton - The action button for the layer.
 * @param {any} rendererObj - The renderer object for the layer.
 * @returns {GeoJSONLayer} - The created GeoJSONLayer.
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
        const actionButton = getProfileActionButton(config.id);
        const rendererObj = createRendererObj(layerConfig.length, index);

        return createLayer(config, actionButton, rendererObj);
    });
};

/**
 * Creates a GeoJSON layer with a popup template.
 *
 * @param {LayerProps} config - The configuration object for the layer.
 * @param {any} layerProfileActionButton - The action button for the layer profile.
 * @returns {GeoJSONLayer} - The created GeoJSON layer.
 */
const createGeoJSONLayer = (config: LayerProps, layerProfileActionButton: any): GeoJSONLayer => {
    const {
        id,
        title,
        desc,
        url,
    } = config;

    const popupTemplate = {
        title,
        content: [{
            type: 'text',
            text: desc,
        }],
        actions: [layerProfileActionButton],
    };

    return new GeoJSONLayer({
        id,
        title,
        url,
        popupEnabled: true,
        popupTemplate,
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
 * Handles the action of selecting a feature and highlighting it on the map.
 *
 * @param {GeoJSONLayer} layer - The GeoJSON layer containing the features.
 * @param {SceneView} view - The SceneView object representing the map view.
 * @param {__esri.Handle} featureHandle - The handle representing the highlighted feature.
 *
 * @returns {Promise<__esri.Handle>} - A promise that resolves to the handle of the highlighted feature.
 */
const handleSelectAction = async (layer: GeoJSONLayer, view: SceneView,
                                  featureHandle: __esri.Handle): Promise<__esri.Handle> => {
    const queriedFeatures = await layer.queryFeatures();
    const firstFeature = queriedFeatures.features[0];
    const layerView = await view.whenLayerView(layer);

    if (featureHandle) featureHandle.remove();
    featureHandle = layerView.highlight(firstFeature);

    return featureHandle;
};

/**
 * Handles the deselect action by removing the highlighted feature.
 *
 * @param {__esri.Handle} highlightedFeature - The handle to the highlighted feature.
 */
const handleDeselectAction = (highlightedFeature: __esri.Handle) => {
    if (highlightedFeature) highlightedFeature.remove();
};

/**
 * Handles the given action based on the actionId.
 * @param {string} actionId - The ID of the action to be handled.
 * @param {GeoJSONLayer} layer - The GeoJSON layer object.
 * @param {SceneView} view - The SceneView object.
 * @param {__esri.Handle} highlightedFeature - The highlighted feature handle.
 * @returns {Promise<__esri.Handle | void>} - The promise that resolves when the action is handled or void if no action
 *     is handled.
 */
const handleAction = async (actionId: string, layer: GeoJSONLayer, view: SceneView,
                            highlightedFeature: __esri.Handle): Promise<__esri.Handle | void> => {
    switch (actionId) {
        case 'full-extent':
            await handleFullExtentAction(layer, view);
            break;
        case 'select':
            return await handleSelectAction(layer, view, highlightedFeature);
        case 'deselect':
            handleDeselectAction(highlightedFeature);
            break;
        default:
            break;
    }
};

/**
 * Creates a new instance of `LayerList` and returns it.
 *
 * @param {SceneView} view - The `SceneView` object representing the view in which the `LayerList` will be displayed.
 * @returns {LayerList} The `LayerList` instance.
 */
const getLayerList = (view: SceneView): LayerList => {
    let highlightedFeature: __esri.Handle;
    const layerList = new LayerList({
        container: document.createElement('div'),
        view: view,
        listItemCreatedFunction: defineLayerListActions,
    });

    layerList.on('trigger-action', async (event) => {
        const actionId = event.action.id;
        const layer = event.item.layer as GeoJSONLayer;
        highlightedFeature = await handleAction(actionId, layer, view, highlightedFeature) || highlightedFeature;
    });

    return layerList;
};

/**
 * Creates an Expand widget with a layer list as content.
 *
 * @param {SceneView} view - The scene view to which the layer list is associated.
 * @returns {Expand} The Expand widget with layer list as content.
 */
export const getLayerListExpand = (view: SceneView): Expand =>
    new Expand({
        expandIcon: 'biking',
        expandTooltip: 'Wyprawy',
        view: view,
        content: getLayerList(view),
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
export const defineLayerListActions = async (event: { item: any; }) => {
    const item = event.item;
    await item.layer.when();
    item.actionsSections = [createActions()];
};
