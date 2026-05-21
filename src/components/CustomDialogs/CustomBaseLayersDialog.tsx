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

export const CustomBaseLayersDialog = ({ opened, onOpenedChanged, headerTitle, closeLabel = 'Zamknij', view }: CustomDialogProps) => {
    const getBasemapGallery = (view: SceneView | null, container?: any): BasemapGallery | null => {
        if (!view) return null;
        return new BasemapGallery({
            view,
            container,
            source: [Basemap.fromId('topo-vector'), Basemap.fromId('hybrid'), Basemap.fromId('streets-vector')],
        });
    };

    const galleryRef = useRef<BasemapGallery | null>(null);

    useEffect(() => {
        return () => {
            galleryRef.current?.destroy();
            galleryRef.current = null;
        };
    }, []);

    const hostCallbackRef = (node: HTMLDivElement | null) => {
        if (node && view && !galleryRef.current) {
            galleryRef.current = getBasemapGallery(view, node);
        }
    };

    return (
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
            <div
                ref={hostCallbackRef}
                style={{
                    width: 300,
                    minHeight: 200,
                }}
            />
        </Dialog>
    );
};
