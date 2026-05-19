import { Dispatch, ReactElement, SetStateAction, useRef } from 'react';
import { useCreateMap } from './hooks/useCreateMap';
import SceneView from '@arcgis/core/views/SceneView';

/**
 * Represents a map element.
 * @returns {ReactElement} The rendered map element.
 */
export const MapElement = ({setView}: {setView: Dispatch<SetStateAction<SceneView | null>>}): ReactElement => {
    const mapRef = useRef<HTMLDivElement | null>(null);
    useCreateMap(mapRef, setView);
    return <div className="MapView" ref={mapRef}></div>;
};
export default MapElement;
