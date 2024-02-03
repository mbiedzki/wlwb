import { getProfileActionButton } from './mapUtils';
import { WLWB2023 } from '../../assets/wlwb 2023';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';

export const getLayers = () => {
    const profileActionButton = getProfileActionButton();

    const blob = new Blob([JSON.stringify(WLWB2023)], {
        type: 'application/json',
    });
    const url = URL.createObjectURL(blob);

    const layer = new GeoJSONLayer({
        id: 'wlwb_2023',
        title: '2023 Krasnystaw - Białystok',
        url,
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
            color: 'red',
        },
    };
    return layer;
};
