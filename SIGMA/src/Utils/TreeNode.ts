export type NodeType = "Facultad" | "Carrera" | "Pensum";

export interface TreeNode {
    id: string;
    name: string;
    type: NodeType;
    parentId: string | null;
    childrenId: string | null;
}