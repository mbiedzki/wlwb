import { Button, Dialog } from '@vaadin/react-components';
import { useEffect, useRef } from 'react';
import Legend from '@arcgis/core/widgets/Legend';
import SceneView from '@arcgis/core/views/SceneView';

interface CustomDialogProps {
    opened: boolean;
    onOpenedChanged: (opened: boolean) => void;
    headerTitle?: string;
    closeLabel?: string;
    view?: SceneView | null;
}

export const CustomLegendDialog = ({ opened, onOpenedChanged, headerTitle, closeLabel = 'Zamknij', view }: CustomDialogProps) => {
    const legendRef = useRef<Legend | null>(null);

    const getLegend = (view: SceneView, container: HTMLDivElement): Legend =>
        new Legend({
            view,
            container,
            // Optional: show layer titles above each legend block
            hideLayersNotInCurrentView: true,
            // style: { type: 'classic' }, // or 'card'
        });

    const hostCallbackRef = (node: HTMLDivElement | null) => {
        if (node && view && !legendRef.current) {
            legendRef.current = getLegend(view, node);
        }
    };

    // Clean up the widget when the component unmounts
    useEffect(() => {
        return () => {
            legendRef.current?.destroy();
            legendRef.current = null;
        };
    }, []);

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
                    width: 320,
                    minHeight: 200,
                }}
            />
        </Dialog>
    );
};
