import {ReactElement, ReactNode } from 'react';
import {
    AppLayout, Button,
    Icon,
} from '@vaadin/react-components';


interface AppHeaderProps {
    /** Page content rendered inside the AppLayout's main area. */
    children?: ReactNode;
}

/**
 * Render the application chrome (top navbar + side drawer) using Vaadin's AppLayout.
 * The actual page content is passed as children and rendered in the main area.
 *
 * @param {AppHeaderProps} props - Component properties.
 * @returns {ReactElement} - The rendered AppLayout component.
 */
export const AppHeader = ({ children }: AppHeaderProps): ReactElement => {
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
                    <Button>
                        <Icon icon="vaadin:align-justify" slot="prefix" />
                        Warstwy podkładowe
                    </Button>
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
