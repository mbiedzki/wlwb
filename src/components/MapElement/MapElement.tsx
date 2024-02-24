import { ReactElement, useRef } from 'react';
import { useCreateMap } from './hooks/useCreateMap';

/**
 * Represents a map element.
 * @returns {ReactElement} The rendered map element.
 */
export const MapElement = (): ReactElement => {
    const mapRef = useRef<HTMLDivElement | null>(null);
    useCreateMap(mapRef);
    return <div className="MapView" ref={mapRef}></div>;
};
export default MapElement;
