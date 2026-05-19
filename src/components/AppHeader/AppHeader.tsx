import { CSSProperties, ReactElement, ReactNode, useEffect, useRef, useState } from 'react';
import { AppLayout, Button, Icon, } from '@vaadin/react-components';
import SceneView from '@arcgis/core/views/SceneView';
import BasemapGallery from '@arcgis/core/widgets/BasemapGallery';
import Basemap from '@arcgis/core/Basemap';


interface AppHeaderProps {
    /** Page content rendered inside the AppLayout's main area. */
    children?: ReactNode;
    view: SceneView | null
}

/**
 * Render the application chrome (top navbar + side drawer) using Vaadin's AppLayout.
 * The actual page content is passed as children and rendered in the main area.
 *
 * @returns {ReactElement} - The rendered AppLayout component.
 * @param view
 * @param container
 */
const getBasemapGallery = ( view: SceneView | null, container?: HTMLElement): BasemapGallery | null => {
    if(!view) return null;
    return new BasemapGallery({
        view,
        container,
        source: [Basemap.fromId('topo-vector'), Basemap.fromId('hybrid'), Basemap.fromId('streets-vector')],
    });
}


export const AppHeader = ({ children, view }: AppHeaderProps): ReactElement => {
    const [open, setOpen] = useState(false);
    const galleryHostRef = useRef<HTMLDivElement | null>(null);
    const galleryRef = useRef<BasemapGallery | null>(null);
    const baseLayersStyle = useRef<CSSProperties | undefined>();

    useEffect(() => {
        if (open && view && galleryHostRef.current && !galleryRef.current) {
           galleryRef.current = getBasemapGallery(view, galleryHostRef.current);
        }
    }, [view, open]);

    useEffect(() => {
        baseLayersStyle.current = {display: `${open ? 'block' : 'none'}`}
    }, [open]);

    return (
        <AppLayout primarySection="drawer" className="AppShell">
            <div slot="drawer" className="AppShell__drawer">
                <h2 className="AppShell__brand">WLWB</h2>
                <div className="AppShell__menu">
                    <Button>
                        <Icon icon="vaadin:road" slot="prefix" />
                        Trasy
                    </Button>
                    <Button>
                        <Icon icon="vaadin:map-marker" slot="prefix" />
                        Miasta
                    </Button>
                    <Button onClick={() => setOpen(!open)}>
                        <Icon icon="vaadin:align-justify" slot="prefix" />
                        Warstwy podkładowe
                    </Button>
                    <div ref={galleryHostRef} className="BaseMapsPanel" style={baseLayersStyle.current}/>
                    <Button>
                        <Icon icon="vaadin:info-circle" slot="prefix" />
                        O projekcie
                    </Button>
                </div>
            </div>

            {children}
        </AppLayout>
    );
};
