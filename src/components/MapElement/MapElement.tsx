import { useRef } from 'react';
import { useCreateMap } from './hooks/useCreateMap';

export const MapElement = () => {
    const mapRef = useRef<HTMLDivElement | null>(null);
    useCreateMap(mapRef);
    return <div className="MapView" ref={mapRef}></div>;
};
export default MapElement;
