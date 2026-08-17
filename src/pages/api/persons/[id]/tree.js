/**
 * Mock: GET /api/v1/persons/{id}/tree?depth=3
 * Response: { root: string, nodes: Person[], edges: Edge[] }
 */
import { buildTree } from "../../mock-data";

export default function handler(req, res) {
  const { id } = req.query;

  const ts = new Date().toISOString().replace("T", " ").slice(0, 23);
  console.log(`[${ts}] [MockAPI] GET tree for personId=${id}`);

  const tree = buildTree(id);

  if (!tree) {
    return res.status(404).json({ detail: `Person ${id} not found` });
  }

  return res.status(200).json(tree);
}
