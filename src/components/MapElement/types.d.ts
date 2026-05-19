export interface LayerProps {
    id: string;
    title: string;
    desc: string;
    url: string;
    visibleOnStart?: boolean;
    fields?: {name: string, alias: string, type: string}[]
}
