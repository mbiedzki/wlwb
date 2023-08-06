import { useRef } from 'react';
import { useCreateMap } from './useCreateMap';

export const MapElement = () => {
    const mapRef = useRef(null);
    useCreateMap(mapRef);
    return <div className="map-view" ref={mapRef}></div>;
};
export default MapElement;
