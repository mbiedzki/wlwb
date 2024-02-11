import { getProfileActionButton } from './mapUtils';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import SceneView from '@arcgis/core/views/SceneView';
import LayerList from '@arcgis/core/widgets/LayerList';
import Expand from '@arcgis/core/widgets/Expand';
import { getRandomColor } from '../../services/utils';
import { layerConfig } from './layerConfig';


export const getLayers = () => {
    return layerConfig.map((config, index) => {
        const profileActionButton = getProfileActionButton(config.id);
        const layer = new GeoJSONLayer({
            id: config.id,
            title: config.title,
            url: config.url,
            popupEnabled: true,
            popupTemplate:
                {
                    title: config.title,
                    content: [{
                        type: 'text',
                        text: config.desc,
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
                color: getRandomColor(layerConfig.length, index),
            },
        };
        return layer;
    });
};

const getLayerList = (view: SceneView) => {
    const layerList = new LayerList({
        container: document.createElement('div'),
        view: view,
        listItemCreatedFunction: defineLayerListActions,
    });
    layerList.on('trigger-action', async (event) => {
        const id = event.action.id;
        const layer = event.item.layer;
        if (id === 'full-extent') {
            await view.goTo(layer.fullExtent);
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
        ],
    ];
};
