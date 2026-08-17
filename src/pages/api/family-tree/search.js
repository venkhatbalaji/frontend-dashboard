/**
 * Mock: POST /api/v1/family-tree/search
 * Body: { searchType: "UNIFIED_ID" | "EID" | "PASSPORT", value: string }
 * Response: { exists: boolean, personId: string | null, person_type: string | null }
 */
import { MOCK_PEOPLE, EID_MAP, PASSPORT_MAP } from "../mock-data";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ detail: "Method not allowed" });
  }

  const { searchType, value } = req.body || {};

  if (!searchType || !value) {
    return res.status(400).json({ detail: "searchType and value are required" });
  }

  const ts = new Date().toISOString().replace("T", " ").slice(0, 23);
  console.log(`[${ts}] [MockAPI] search type=${searchType} value=${value}`);

  let personId = null;

  if (searchType === "UNIFIED_ID") {
    if (MOCK_PEOPLE[value]) personId = value;
  } else if (searchType === "EID") {
    personId = EID_MAP[value] || null;
  } else if (searchType === "PASSPORT") {
    personId = PASSPORT_MAP[value] || null;
  } else {
    return res.status(400).json({ detail: `Unknown searchType: ${searchType}` });
  }

  if (!personId) {
    return res.status(200).json({ exists: false, personId: null, person_type: null });
  }

  const person = MOCK_PEOPLE[personId];
  return res.status(200).json({
    exists: true,
    personId,
    person_type: person?.person_type || "citizen",
  });
}
