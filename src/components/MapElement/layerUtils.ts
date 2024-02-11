import { getProfileActionButton } from './mapUtils';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import SceneView from '@arcgis/core/views/SceneView';
import LayerList from '@arcgis/core/widgets/LayerList';
import Expand from '@arcgis/core/widgets/Expand';
import { getRandomColor } from '../../services/utils';
import { layerConfig } from './layerConfig';
import { LayerProps } from './types';


export const getLayers = () => {
    return layerConfig.map((config, index) => {
        const { id } = config;
        const layerProfileActionButton = getProfileActionButton(id);
        const layer = createGeoJSONLayer(config, layerProfileActionButton);
        (layer as any).renderer = {
            type: 'simple',
            symbol: {
                type: 'simple-line',
                width: 3,
                style: 'solid',
                color: getRandomColor(layerConfig.length, index),
            },
        };
        return layer;
    });
};

const createGeoJSONLayer = (config: LayerProps, layerProfileActionButton: any) => {
    const {
        id,
        title,
        desc,
        url,
    } = config;
    return new GeoJSONLayer({
        id,
        title,
        url,
        popupEnabled: true,
        popupTemplate: {
            title,
            content: [{
                type: 'text',
                text: desc,
            }],
            actions: [layerProfileActionButton],
        },
    });
};

const handleFullExtentAction = async (layer: GeoJSONLayer, view: SceneView) => {
    await view.goTo(layer.fullExtent);
};

const handleSelectAction = async (layer: GeoJSONLayer, view: SceneView, highlightedFeature: __esri.Handle) => {
    const queriedFeatures = await layer.queryFeatures();
    const feature = queriedFeatures.features[0];
    await view.whenLayerView(layer).then(layerView => {
        if (highlightedFeature) highlightedFeature.remove();
        highlightedFeature = layerView.highlight(feature);
    });
    return highlightedFeature;
};

const handleDeselectAction = (highlightedFeature: __esri.Handle) => {
    if (highlightedFeature) highlightedFeature.remove();
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

        switch (actionId) {
            case 'full-extent':
                await handleFullExtentAction(layer, view);
                break;
            case 'select':
                highlightedFeature = await handleSelectAction(layer, view, highlightedFeature);
                break;
            case 'deselect':
                handleDeselectAction(highlightedFeature);
                break;
            default:
                break;
        }
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

export const defineLayerListActions = async (event: { item: any; }) => {
    const item = event.item;
    await item.layer.when();
    item.actionsSections = [
        [
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
        ],
    ];
};
