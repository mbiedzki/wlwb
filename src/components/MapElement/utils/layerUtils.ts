import { getProfileActionButton } from './mapUtils';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import SceneView from '@arcgis/core/views/SceneView';
import LayerList from '@arcgis/core/widgets/LayerList';
import Expand from '@arcgis/core/widgets/Expand';
import { getRandomColor } from '../../../services/utils';
import { layerConfig } from '../config/layerConfig';
import { LayerProps } from '../types';
import ActionButton from '@arcgis/core/support/actions/ActionButton';


const createRendererObj = (numOfSteps: number, step: number) => ({
    type: 'simple',
    symbol: {
        type: 'simple-line',
        width: 3,
        style: 'solid',
        color: getRandomColor(numOfSteps, step),
    },
});

const createLayer = (config: LayerProps, actionButton: ActionButton, rendererObj: any) => {
    const layer = createGeoJSONLayer(config, actionButton);
    (layer as any).renderer = rendererObj;

    return layer;
};

export const getLayers = () => {
    return layerConfig.map((config, index) => {
        const actionButton = getProfileActionButton(config.id);
        const rendererObj = createRendererObj(layerConfig.length, index);

        return createLayer(config, actionButton, rendererObj);
    });
};

const createGeoJSONLayer = (config: LayerProps, layerProfileActionButton: any) => {
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

const handleFullExtentAction = async (layer: GeoJSONLayer, view: SceneView) => {
    await view.goTo(layer.fullExtent);
};

const handleSelectAction = async (layer: GeoJSONLayer, view: SceneView, featureHandle: __esri.Handle) => {
    const queriedFeatures = await layer.queryFeatures();
    const firstFeature = queriedFeatures.features[0];
    const layerView = await view.whenLayerView(layer);

    if (featureHandle) featureHandle.remove();
    featureHandle = layerView.highlight(firstFeature);

    return featureHandle;
};

const handleDeselectAction = (highlightedFeature: __esri.Handle) => {
    if (highlightedFeature) highlightedFeature.remove();
};

const handleAction = async (actionId: string, layer: GeoJSONLayer, view: SceneView,
                            highlightedFeature: __esri.Handle) => {
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

const getLayerList = (view: SceneView) => {
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

export const getLayerListExpand = (view: SceneView) =>
    new Expand({
        expandIcon: 'biking',
        expandTooltip: 'Wyprawy',
        view: view,
        content: getLayerList(view),
    });

const createActions = () => {
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

export const defineLayerListActions = async (event: { item: any; }) => {
    const item = event.item;
    await item.layer.when();
    item.actionsSections = [createActions()];
};
