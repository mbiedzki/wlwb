import { HoverHitInfo } from '../MapElement/utils/popupUtils';
import { useEffect } from 'react';
import { Dialog } from '@vaadin/react-components';

interface Props {
    hit: HoverHitInfo | null;
}

const positionOverlay = (x: number, y: number) => {
    const overlay = document.querySelector('vaadin-dialog-overlay') as HTMLElement | null;
    if (!overlay) return false;

    // The visible box is the [part="overlay"] inside the shadow root.
    const part = overlay.shadowRoot?.querySelector('[part="overlay"]') as HTMLElement | null;
    if (!part) return false;

    // Kill Vaadin's centering and apply our coords.
    part.style.position = 'fixed';
    part.style.margin = '0';
    part.style.inset = 'auto'; // clears top/right/bottom/left set by Vaadin
    part.style.transform = 'none';
    part.style.left = `${x + 12}px`;
    part.style.top = `${y + 12}px`;
    return true;
};

export const HoverPopupDialog = ({ hit }: Props) => {
    useEffect(() => {
        if (!hit) return;

        // Try now, on next frame, and on a short retry – the overlay might
        // not be in the DOM during the very first open.
        let raf1 = 0;
        let raf2 = 0;
        let attempts = 0;
        const tryPosition = () => {
            if (positionOverlay(hit.page.x, hit.page.y)) return;
            if (++attempts < 10) raf2 = requestAnimationFrame(tryPosition);
        };
        raf1 = requestAnimationFrame(tryPosition);

        return () => {
            cancelAnimationFrame(raf1);
            cancelAnimationFrame(raf2);
        };
    }, [hit]);

    return (
        <Dialog opened={!!hit} modeless noCloseOnEsc noCloseOnOutsideClick>
            <>
                <div
                    style={{
                        minWidth: 10,
                        color: 'var(--lumo-primary-text-color)',
                    }}
                >
                    {hit && <div>{(hit.graphic as any).layer?.title}</div>}
                </div>
            </>
        </Dialog>
    );
};
