import SceneView from '@arcgis/core/views/SceneView';
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer';

export interface HoverHitInfo {
    graphic: __esri.Graphic;
    page: { x: number; y: number };
}

/**
 * Enables "open popup on hover" behaviour for the given view.
 * Returns an IHandle so the caller can remove the listener on cleanup.
 *
 * @param view      The SceneView (or MapView) to attach hover behaviour to.
 * @param options   Optional tuning:
 *                  - debounceMs:    how long the cursor must rest before opening (default 120 ms)
 *                  - includeLayers: limit hover detection to these layers
 */
export const enableHoverPopups = (
    view: SceneView,
    options?: {
        debounceMs?: number;
        includeLayers?: GeoJSONLayer[];
        onHit?: (info: HoverHitInfo | null) => void;
    },
): IHandle => {
    const debounceMs = options?.debounceMs ?? 60;
    let timer: number | undefined;
    let lastFeatureId: string | number | null = null;
    let highlightHandle: IHandle | undefined;

    const clearHighlight = () => {
        highlightHandle?.remove();
        highlightHandle = undefined;
    };

    const pointerHandle = view.on('pointer-move', (event) => {
        if (timer) window.clearTimeout(timer);

        timer = window.setTimeout(async () => {
            try {
                const hitOptions = options?.includeLayers ? { include: options.includeLayers } : undefined;
                const response = await view.hitTest(
                    {
                        x: event.x,
                        y: event.y,
                    },
                    hitOptions,
                );

                const graphicHit = response.results.find((r) => r.type === 'graphic') as any | undefined;

                if (!graphicHit || view.popup?.visible) {
                    lastFeatureId = null;
                    clearHighlight();
                    options?.onHit?.(null);
                    return;
                }

                const graphic = graphicHit.graphic;
                const fid = graphic.attributes?.OBJECTID ?? graphic.attributes?.id ?? (graphic as any).uid ?? null;

                if (fid === lastFeatureId) return;
                lastFeatureId = fid;

                // --- highlight the hit feature ---
                clearHighlight();
                const layer = graphic.layer as __esri.Layer | null;
                if (layer) {
                    try {
                        const layerView = await view.whenLayerView(layer);
                        // highlight() exists on FeatureLayerView, GeoJSONLayerView, SceneLayerView, etc.
                        highlightHandle = (layerView as any).highlight?.(graphic);
                    } catch {
                        /* layer view not ready / not highlightable */
                    }
                }

                const screen = view.toScreen(graphicHit.mapPoint);
                const rect = (view.container as HTMLElement).getBoundingClientRect();
                const page = {
                    x: rect.left + screen.x,
                    y: rect.top + screen.y,
                };

                options?.onHit?.({
                    graphic,
                    page,
                });
            } catch {
                /* ignore hitTest aborts on rapid mouse movement */
            }
        }, debounceMs);
    });

    return {
        remove: () => {
            if (timer) window.clearTimeout(timer);
            clearHighlight();
            pointerHandle.remove();
        },
    };
};
