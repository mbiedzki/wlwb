import { Button, Dialog } from '@vaadin/react-components';
import { useEffect, useRef } from 'react';
import BasemapGallery from '@arcgis/core/widgets/BasemapGallery';
import SceneView from '@arcgis/core/views/SceneView';
import Basemap from '@arcgis/core/Basemap';

interface CustomDialogProps {
    opened: boolean;
    onOpenedChanged: (opened: boolean) => void;
    headerTitle?: string;
    closeLabel?: string;
    view?: SceneView | null;
}

export const CustomDialog = ({ opened, onOpenedChanged, headerTitle, closeLabel = 'Zamknij', view }: CustomDialogProps) => {
    const getBasemapGallery = (view: SceneView | null, container?: any): BasemapGallery | null => {
        if (!view) return null;
        return new BasemapGallery({
            view,
            container,
            source: [Basemap.fromId('topo-vector'), Basemap.fromId('hybrid'), Basemap.fromId('streets-vector')],
        });
    };

    const galleryHostRef = useRef<any>();

    useEffect(() => {
        if (view) getBasemapGallery(view, galleryHostRef.current);
    }, [opened, view]);

    return (
        <>
            <Dialog
                opened={opened}
                headerTitle={headerTitle}
                onOpenedChanged={(e) => onOpenedChanged(e.detail.value)}
                footer={
                    <Button theme="primary" onClick={() => onOpenedChanged(false)}>
                        {closeLabel}
                    </Button>
                }
            >
                <div ref={galleryHostRef} className="BaseMapsPanel" />
            </Dialog>
        </>
    );
};
