import { getProfileActionButton } from './mapUtils';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';
import SceneView from '@arcgis/core/views/SceneView';
import LayerList from '@arcgis/core/widgets/LayerList';
import Expand from '@arcgis/core/widgets/Expand';
import { getRandomColor } from '../../services/utils';

export interface LayerProps {
    id: string;
    title: string;
    url: string;
}

const layerConfig: LayerProps[] = [{
    id: '2023',
    title: '2023 Krasnystaw - Białystok',
    url: 'http://vps658602.ovh.net/wlwb_layers/2023.json',
}];

export const getLayers = () => {
    const profileActionButton = getProfileActionButton();
    return layerConfig.map((config, index) => {
        const layer = new GeoJSONLayer({
            id: config.id,
            title: config.title,
            url: config.url,
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
