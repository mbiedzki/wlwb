import { ReactElement, ReactNode, useState } from 'react';
import { AppLayout, Button, Icon } from '@vaadin/react-components';
import SceneView from '@arcgis/core/views/SceneView';
import { CustomDialog } from '../CustomDialog/CustomDialog';

interface AppHeaderProps {
    /** Page content rendered inside the AppLayout's main area. */
    children?: ReactNode;
    view: SceneView | null;
}

/**
 * Render the application chrome (top navbar + side drawer) using Vaadin's AppLayout.
 * The actual page content is passed as children and rendered in the main area.
 *
 * @returns {ReactElement} - The rendered AppLayout component.
 * @param view
 * @param container
 */

export const AppHeader = ({ children, view }: AppHeaderProps): ReactElement => {
    const [open, setOpen] = useState(false);

    const header = (
        <div className="initials-list">
            <h2>
                <span className="initial">W</span>ielkie
            </h2>
            <h2>
                <span className="initial">L</span>etnie
            </h2>
            <h2>
                <span className="initial">W</span>yprawy
            </h2>
            <h2>
                <span className="initial">B</span>ikerskie
            </h2>
        </div>
    );

    return (
        <AppLayout primarySection="drawer" className="AppShell">
            <div slot="drawer" className="AppShell__drawer">
                {header}
                <br />
                <img src={`${process.env.PUBLIC_URL}/mainPhoto.jpg`} alt="Wielkie Letnie Wyprawy Rowerowe Logo" />
                <br />
                <div className="AppShell__menu">
                    <Button>
                        <Icon icon="vaadin:road" slot="prefix" />
                        Trasy
                    </Button>
                    <Button>
                        <Icon icon="vaadin:map-marker" slot="prefix" />
                        Miasta
                    </Button>
                    <Button
                        onClick={() => {
                            setOpen(!open);
                        }}
                    >
                        <Icon icon="vaadin:align-justify" slot="prefix" />
                        Podkład mapy
                    </Button>
                    <Button>
                        <Icon icon="vaadin:info-circle" slot="prefix" />O projekcie
                    </Button>
                </div>
            </div>
            <CustomDialog opened={open} onOpenedChanged={setOpen} headerTitle="Warstwy podkładowe" closeLabel="Zamknij" view={view} />

            {children}
        </AppLayout>
    );
};
