import { useEffect, useRef, useState, useLayoutEffect } from "react";
import { useIntl } from "react-intl";

// Production-no-op: kept so existing call sites remain valid without printing.
// Replace the body with a console.* call if you need to re-enable debug output.
function tsLog() {}

// ─── Helper functions ────────────────────────────────────────────────────────

function buildAdj(data) {
  const parentsOf = new Map();
  const childrenOf = new Map();
  const spousesOf = new Map();
  const siblingsOf = new Map();

  (data.edges || []).forEach((e) => {
    if (!e || !e.source || !e.target) return;
    const T = String(e.type || "").toUpperCase();
    if (T === "CHILD_OF") {
      if (!parentsOf.has(e.source)) parentsOf.set(e.source, new Set());
      parentsOf.get(e.source).add(e.target);
      if (!childrenOf.has(e.target)) childrenOf.set(e.target, new Set());
      childrenOf.get(e.target).add(e.source);
    } else if (T === "SPOUSE_OF") {
      if (!spousesOf.has(e.source)) spousesOf.set(e.source, new Set());
      spousesOf.get(e.source).add(e.target);
      if (!spousesOf.has(e.target)) spousesOf.set(e.target, new Set());
      spousesOf.get(e.target).add(e.source);
    } else if (T === "SIBLING_OF") {
      if (!siblingsOf.has(e.source)) siblingsOf.set(e.source, new Set());
      siblingsOf.get(e.source).add(e.target);
      if (!siblingsOf.has(e.target)) siblingsOf.set(e.target, new Set());
      siblingsOf.get(e.target).add(e.source);
    }
  });

  return { parentsOf, childrenOf, spousesOf, siblingsOf };
}

function computedSiblingsOf(id, parentsOf, childrenOf) {
  const ps = parentsOf.get(id) || new Set();
  const out = new Set();
  ps.forEach((p) => {
    (childrenOf.get(p) || new Set()).forEach((c) => {
      if (c !== id) out.add(c);
    });
  });
  return out;
}

function spouseParents(spouses, parentsOf) {
  const out = new Set();
  spouses.forEach((s) => {
    (parentsOf.get(s) || new Set()).forEach((p) => out.add(p));
  });
  return out;
}

function gpOf(id, parentsOf) {
  const res = new Set();
  (parentsOf.get(id) || new Set()).forEach((p) => {
    (parentsOf.get(p) || new Set()).forEach((g) => res.add(g));
  });
  return res;
}

function grandKidsOf(id, childrenOf) {
  const gs = new Set();
  (childrenOf.get(id) || new Set()).forEach((k) => {
    (childrenOf.get(k) || new Set()).forEach((gc) => gs.add(gc));
  });
  return gs;
}

function firstWords(name, n = 1) {
  if (!name) return "";
  const toks = String(name).trim().split(/\s+/);
  return toks.slice(0, n).join(" ");
}

// Group-centering (below) can shift a small group toward its parent's midpoint
// while a neighboring group doesn't move at all, which can pull two adjacent
// cards closer together than the row's normal spacing — even to the point of
// overlapping when group sizes are uneven (e.g. 2/1/2 children across three
// marriages). This sweep restores a minimum gap between every adjacent pair
// left-to-right, then re-centers the whole row on its pre-sweep centroid so
// the "centered under parents" intent introduced by the caller is preserved
// as closely as possible.
function enforceMinSpacing(items, minGap) {
  if (items.length < 2) return;
  items.sort((a, b) => a.x - b.x);
  const before = items.reduce((sum, it) => sum + it.x, 0) / items.length;
  for (let i = 1; i < items.length; i++) {
    const minX = items[i - 1].x + minGap;
    if (items[i].x < minX) items[i].x = minX;
  }
  const after = items.reduce((sum, it) => sum + it.x, 0) / items.length;
  const drift = after - before;
  items.forEach((it) => { it.x -= drift; });
}

function boundsFromCoords(coords, ids) {
  const xs = [];
  const ys = [];
  ids.forEach((id) => {
    const c = coords.get(id);
    if (c) { xs.push(c.x); ys.push(c.y); }
  });
  if (!xs.length) return { cx: 0, cy: 0, minX: 0, maxX: 0, minY: 0, maxY: 0 };
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return { cx: (minX + maxX) / 2, cy: (minY + maxY) / 2, minX, maxX, minY, maxY };
}

// ─── Five-tier layout ────────────────────────────────────────────────────────
// Lays out nodes on a discrete grid (one slot per node per row) so siblings,
// spouses and children never share an X coordinate. Children are then re-centered
// under the (root + spouse) midpoint of their parents, and grandchildren are
// re-centered under their respective parent.

function layoutFiveTier(data, adj, root, GAP, Y, ID_INLAWS, ID_GPS_M, ID_GPS_F, ID_GCK, expandedClusters = new Set(), isRtl = false) {
  const { parentsOf, childrenOf, spousesOf, siblingsOf: siblingsMap } = adj;
  const idMap = new Map(data.nodes.map((n) => [n.id, n]));

  const spouses = new Set(spousesOf.get(root) || []);
  const parents = new Set(parentsOf.get(root) || []);
  const explicitSiblings = new Set((siblingsMap || new Map()).get(root) || []);
  const compSiblings = computedSiblingsOf(root, parentsOf, childrenOf);
  const siblings = new Set([...explicitSiblings, ...compSiblings]);
  const children = new Set(childrenOf.get(root) || []);
  const inlawParents = spouseParents(spouses, parentsOf);
  const grandkids = grandKidsOf(root, childrenOf);

  const coords = new Map();

  // ── Row 0: siblings(left) | root | spouses(right) ────────────────────────
  const sibArr = Array.from(siblings).filter((s) => !spouses.has(s)).sort();
  const spousesArr = Array.from(spouses).sort();

  // Lay out left-to-right: [siblings...] [root] [spouses...]
  const row0 = [...sibArr, root, ...spousesArr];
  const row0Center = (row0.length - 1) / 2;
  row0.forEach((id, i) => {
    coords.set(id, { x: (i - row0Center) * GAP, y: Y.MID });
  });

  const rootX = coords.get(root).x;

  // ── Row +1: parents centered above root ──────────────────────────────────
  const pArr = Array.from(parents);
  const father = pArr.find((p) => ((idMap.get(p) || {}).kin || "").toLowerCase() === "father") || pArr[0];
  const mother = pArr.find((p) => ((idMap.get(p) || {}).kin || "").toLowerCase() === "mother") || pArr.find((p) => p !== father);
  if (father) coords.set(father, { x: rootX - GAP / 2, y: Y.P });
  if (mother) coords.set(mother, { x: rootX + GAP / 2, y: Y.P });

  // In-laws cluster placed to the far right of all spouses
  const inlaws = Array.from(inlawParents).filter((id) => !parents.has(id));
  const inlawsVisible = inlaws.filter((id) => idMap.has(id));
  if (inlawsVisible.length > 0) {
    const rightmostSpouseX = spousesArr.length
      ? Math.max(...spousesArr.map((s) => coords.get(s)?.x || 0))
      : rootX;
    coords.set(ID_INLAWS, { x: rightmostSpouseX + GAP, y: Y.P });
  }

  // ── Row +2: grandparent clusters ─────────────────────────────────────────
  const gpsF = father ? gpOf(father, parentsOf) : new Set();
  const gpsM = mother ? gpOf(mother, parentsOf) : new Set();
  const gpsFVisible = Array.from(gpsF).filter((id) => idMap.has(id));
  const gpsMVisible = Array.from(gpsM).filter((id) => idMap.has(id));
  if (gpsFVisible.length > 0) {
    const fx = father ? coords.get(father).x : rootX - GAP / 2;
    coords.set(ID_GPS_F, { x: fx, y: Y.GP });
  }
  if (gpsMVisible.length > 0) {
    const mx = mother ? coords.get(mother).x : rootX + GAP / 2;
    coords.set(ID_GPS_M, { x: mx, y: Y.GP });
  }

  // ── Row -1: children, grouped by mother, then placed on a global grid ────
  const KEY_ROOT = "__root__";
  const childGroups = new Map(); // mother-id (or KEY_ROOT) → child ids
  Array.from(children).forEach((c) => {
    const ps = Array.from(parentsOf.get(c) || []);
    const motherId = ps.find((p) => ((idMap.get(p) || {}).sex || "F") === "F") || null;
    const key = motherId && spouses.has(motherId) ? motherId : KEY_ROOT;
    if (!childGroups.has(key)) childGroups.set(key, []);
    childGroups.get(key).push(c);
  });
  childGroups.forEach((arr) => arr.sort());

  // Order child groups by the X of their associated parent (root vs each spouse)
  const orderedGroupKeys = Array.from(childGroups.keys()).sort((a, b) => {
    const xa = a === KEY_ROOT ? rootX : (coords.get(a)?.x || 0);
    const xb = b === KEY_ROOT ? rootX : (coords.get(b)?.x || 0);
    return xa - xb;
  });

  // Place children on a single non-overlapping global row, then shift each group
  // so its center aligns under (root,parent) midpoint.
  const allChildSlots = []; // [{id, group}]
  orderedGroupKeys.forEach((key) => {
    childGroups.get(key).forEach((cid) => allChildSlots.push({ id: cid, group: key }));
  });
  if (allChildSlots.length > 0) {
    const totalChildren = allChildSlots.length;
    const childCenter = (totalChildren - 1) / 2;
    // First pass: linear placement
    const tmpX = new Map();
    allChildSlots.forEach((s, i) => tmpX.set(s.id, (i - childCenter) * GAP + rootX));

    // Second pass: shift each group so the group's centroid sits under the
    // midpoint of (root, mother) — preserves group ordering and stops overlap.
    const groupOrder = orderedGroupKeys;
    groupOrder.forEach((key) => {
      const groupChildren = childGroups.get(key);
      if (!groupChildren.length) return;
      const groupCentroid = groupChildren.reduce((sum, cid) => sum + tmpX.get(cid), 0) / groupChildren.length;
      const motherX = key === KEY_ROOT ? rootX : (coords.get(key)?.x || rootX);
      const desiredCentroid = (rootX + motherX) / 2;
      const shift = desiredCentroid - groupCentroid;
      // Apply a soft shift (capped) so groups don't drift on top of each other
      const cappedShift = Math.max(-GAP / 2, Math.min(GAP / 2, shift));
      groupChildren.forEach((cid) => tmpX.set(cid, tmpX.get(cid) + cappedShift));
    });

    const childSpacing = allChildSlots.map((s) => ({ id: s.id, x: tmpX.get(s.id) }));
    enforceMinSpacing(childSpacing, GAP);
    childSpacing.forEach((it) => coords.set(it.id, { x: it.x, y: Y.C }));
  }

  // ── Row -2: grandchildren cluster or expanded grid ───────────────────────
  const grandkidsVisible = Array.from(grandkids).filter((id) => idMap.has(id));
  if (expandedClusters.has(ID_GCK) && grandkidsVisible.length > 0) {
    // Group grandchildren by their parent (one of the children above)
    const gcByParent = new Map();
    grandkidsVisible.forEach((gid) => {
      const gcParents = Array.from(parentsOf.get(gid) || []);
      const inFamily = gcParents.find((p) => children.has(p));
      const key = inFamily || "__unknown__";
      if (!gcByParent.has(key)) gcByParent.set(key, []);
      gcByParent.get(key).push(gid);
    });
    gcByParent.forEach((arr) => arr.sort());

    // Order parent groups by the parent's X
    const gcGroupKeys = Array.from(gcByParent.keys()).sort((a, b) => {
      const xa = coords.get(a)?.x ?? 0;
      const xb = coords.get(b)?.x ?? 0;
      return xa - xb;
    });

    // Flat global row across all grandchildren, then per-group recenter
    const flat = [];
    gcGroupKeys.forEach((k) => gcByParent.get(k).forEach((gid) => flat.push({ id: gid, group: k })));
    const totalGc = flat.length;
    const gcCenter = (totalGc - 1) / 2;
    const tmpX = new Map();
    flat.forEach((s, i) => tmpX.set(s.id, (i - gcCenter) * GAP + rootX));

    gcGroupKeys.forEach((k) => {
      const arr = gcByParent.get(k);
      if (!arr.length) return;
      const centroid = arr.reduce((sum, gid) => sum + tmpX.get(gid), 0) / arr.length;
      const parentX = coords.get(k)?.x ?? rootX;
      const shift = parentX - centroid;
      const cappedShift = Math.max(-GAP / 2, Math.min(GAP / 2, shift));
      arr.forEach((gid) => tmpX.set(gid, tmpX.get(gid) + cappedShift));
    });

    const gcSpacing = flat.map((s) => ({ id: s.id, x: tmpX.get(s.id) }));
    enforceMinSpacing(gcSpacing, GAP);
    gcSpacing.forEach((it) => coords.set(it.id, { x: it.x, y: Y.GC }));
  } else if (grandkidsVisible.length > 0) {
    coords.set(ID_GCK, { x: rootX, y: Y.GC });
  }

  // ── Build explicit node set ──────────────────────────────────────────────
  const explicit = new Set([root, ...spousesArr, ...sibArr, father, mother, ...Array.from(children)].filter(Boolean));
  if (coords.has(ID_INLAWS)) explicit.add(ID_INLAWS);
  if (coords.has(ID_GPS_F)) explicit.add(ID_GPS_F);
  if (coords.has(ID_GPS_M)) explicit.add(ID_GPS_M);
  if (expandedClusters.has(ID_GCK)) grandkidsVisible.forEach((gid) => explicit.add(gid));
  else if (coords.has(ID_GCK)) explicit.add(ID_GCK);

  // ── Build filtered edges ─────────────────────────────────────────────────
  const edges = [];
  (data.edges || []).forEach((e) => {
    if (!e || e.source === e.target) return;
    if (!explicit.has(e.source) || !explicit.has(e.target)) return;
    const T = String(e.type || "").toUpperCase();
    if (T === "CHILD_OF") {
      const ps = parentsOf.get(e.source) || new Set();
      if (ps.has(e.target)) edges.push({ source: e.source, target: e.target, type: "CHILD_OF", parent_sex: e.parent_sex || null });
    } else if (T === "SPOUSE_OF") {
      const sp = spousesOf.get(e.source) || new Set();
      if (sp.has(e.target)) edges.push({ source: e.source, target: e.target, type: "SPOUSE_OF", relationship_status: e.relationship_status || "active" });
    } else if (T === "SIBLING_OF") {
      if (explicit.has(e.source) && explicit.has(e.target)) edges.push({ source: e.source, target: e.target, type: "SIBLING_OF" });
    }
  });

  spousesArr.forEach((spouse) => {
    const hasEdge = edges.some((e) => e.type === "SPOUSE_OF" && ((e.source === root && e.target === spouse) || (e.source === spouse && e.target === root)));
    if (!hasEdge && explicit.has(root) && explicit.has(spouse)) {
      edges.push({ source: root, target: spouse, type: "SPOUSE_OF", relationship_status: "active" });
    }
  });

  if (coords.has(ID_GPS_F) && father) edges.push({ source: ID_GPS_F, target: father, type: "PATERNAL_GP" });
  if (coords.has(ID_GPS_M) && mother) edges.push({ source: ID_GPS_M, target: mother, type: "MATERNAL_GP" });
  if (coords.has(ID_INLAWS)) {
    if (spousesArr.length) spousesArr.forEach((s) => edges.push({ source: ID_INLAWS, target: s, type: "IN_LAW" }));
    else edges.push({ source: ID_INLAWS, target: root, type: "IN_LAW" });
  }

  const halfSiblingPairs = new Set();
  const hasSiblingEdge = (a, b) => (data.edges || []).some((e) => e && e.type === "SIBLING_OF" && ((e.source === a && e.target === b) || (e.source === b && e.target === a)));
  const isClusterId = (id) => typeof id === "string" && id.startsWith("__cluster_");
  const motherOf = (id) => Array.from(parentsOf.get(id) || []).find((p) => ((idMap.get(p) || {}).sex || "").toUpperCase() === "F");
  const fatherOf = (id) => Array.from(parentsOf.get(id) || []).find((p) => ((idMap.get(p) || {}).sex || "").toUpperCase() === "M");
  const explicitPeople = Array.from(explicit).filter((id) => !isClusterId(id));
  explicitPeople.forEach((p1, idx) => {
    for (let j = idx + 1; j < explicitPeople.length; j++) {
      const p2 = explicitPeople[j];
      if (!p1 || !p2) continue;
      const parents1 = parentsOf.get(p1) || new Set();
      const parents2 = parentsOf.get(p2) || new Set();
      const sharedParents = new Set([...parents1].filter((p) => parents2.has(p)));
      if (sharedParents.size === 0) continue;
      const sameMother = motherOf(p1) && motherOf(p1) === motherOf(p2);
      const sameFather = fatherOf(p1) && fatherOf(p1) === fatherOf(p2);
      const bothParentsShared = sameMother && sameFather;
      if (bothParentsShared || hasSiblingEdge(p1, p2)) continue;
      const key = [p1, p2].sort().join("-");
      if (halfSiblingPairs.has(key)) continue;
      halfSiblingPairs.add(key);
      edges.push({ source: p1, target: p2, type: "HALF_SIBLING_OF" });
    }
  });

  if (coords.has(ID_GCK) && !expandedClusters.has(ID_GCK)) {
    const kids = Array.from(children);
    if (kids.length) kids.forEach((k) => edges.push({ source: ID_GCK, target: k, type: "DESCENDANT" }));
    else edges.push({ source: ID_GCK, target: root, type: "DESCENDANT" });
  }
  if (expandedClusters.has(ID_GCK)) {
    grandkidsVisible.forEach((gid) => {
      const gcParents = parentsOf.get(gid) || new Set();
      gcParents.forEach((parentId) => {
        if (explicit.has(parentId)) edges.push({ source: gid, target: parentId, type: "CHILD_OF", parent_sex: (idMap.get(parentId) || {}).sex || null });
      });
    });
  }

  // Mirror the whole tree horizontally for RTL locales — every position above
  // is computed in a fixed LTR sense (siblings-left/root/spouses-right,
  // children left-to-right by group), so flipping x here as a final step is
  // the only change needed for the tree itself to read right-to-left; the
  // relative ordering (group order, spacing, centering) is preserved, just mirrored.
  if (isRtl) {
    coords.forEach((c, id) => coords.set(id, { x: -c.x, y: c.y }));
  }

  return { coords, explicitIds: explicit, edges };
}

// Wider vertical separation between tiers so cards never visually overlap rows.
const Y_TIERS = { GP: -5.0, P: -2.5, MID: 0, C: 2.5, GC: 5.0 };

function waitForSize(el, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const ok = () => el.clientWidth > 0 && el.clientHeight > 0;
    if (ok()) return resolve();
    const ro = new ResizeObserver(() => { if (ok()) { ro.disconnect(); resolve(); } });
    ro.observe(el);
    const t = setTimeout(() => { ro.disconnect(); reject(new Error("Timed out")); }, timeout);
    // eslint-disable-next-line no-unused-expressions
    t;
  });
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function FamilyGraph({ treeData, personId, onPersonSelect, onNodeClick, isRtl }) {
  const intl = useIntl();
  const containerRef = useRef(null);
  const cancelledRef = useRef(false); // toggled in cleanup so the async init can bail mid-flight
  const handlersRef = useRef({ onPersonSelect, onNodeClick });
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [currentRoot, setCurrentRoot] = useState(personId);
  const [expandedClusters, setExpandedClusters] = useState(new Set());

  // Keep handler refs current without putting them in the init effect's deps —
  // a new parent render handing us a new function shouldn't tear down Sigma.
  useEffect(() => { handlersRef.current = { onPersonSelect, onNodeClick }; }, [onPersonSelect, onNodeClick]);

  useEffect(() => {
    setCurrentRoot(personId);
    setExpandedClusters(new Set());
  }, [personId]);

  const ID_INLAWS = "__cluster_inlaws__";
  const ID_GPS_M = "__cluster_grandparents_m__";
  const ID_GPS_F = "__cluster_grandparents_f__";
  const ID_GCK = "__cluster_grandchildren__";
  const UNIT = 140;
  const GAP = 4.2;
  const CARD_WIDTH = 160;
  // Largest world-units-per-pixel ratio (i.e. most zoomed out) at which
  // same-row cards, spaced GAP*UNIT apart in world space, still keep a
  // small gap on screen at full card size. Beyond this ratio, fitting the
  // whole tree would require zooming out further than fixed-width cards
  // can tolerate without visually overlapping — so instead of clamping the
  // zoom (which used to clip wide trees and force the user to pan/scroll
  // to see the rest), computeFit() shrinks the cards themselves via
  // `cardScale` so the entire tree still fits in one view.
  const NO_OVERLAP_MAX_RATIO = (GAP * UNIT) / (CARD_WIDTH + 8);
  // Floor on how much a wide tree is allowed to shrink cards to fit. Beyond
  // this, text stops being legible, so very large/wide trees (well past a
  // typical 20-30 member family) may still need a little panning — a much
  // rarer case than the everyday "many siblings/spouses" one this fixes.
  const CARD_MIN_SCALE = 0.6;

  // Pre-translate cluster labels and toolbar buttons (reactive to locale)
  const LBL = {
    grandchildren: intl.formatMessage({ id: "family_tree_cluster_grandchildren" }),
    paternalGp:    intl.formatMessage({ id: "family_tree_cluster_paternal_gp" }),
    maternalGp:    intl.formatMessage({ id: "family_tree_cluster_maternal_gp" }),
    inlaws:        intl.formatMessage({ id: "family_tree_cluster_inlaws" }),
    btnReset:      intl.formatMessage({ id: "family_tree_btn_reset" }),
    btnFit:        intl.formatMessage({ id: "family_tree_btn_fit" }),
    btnFullscreen: intl.formatMessage({ id: "family_tree_btn_fullscreen" }),
    btnExit:       intl.formatMessage({ id: "family_tree_btn_exit" }),
    btnZoomIn:     intl.formatMessage({ id: "family_tree_btn_zoom_in" }),
    btnZoomOut:    intl.formatMessage({ id: "family_tree_btn_zoom_out" }),
    rowGrandparents:  intl.formatMessage({ id: "family_tree_row_grandparents" }),
    rowParents:       intl.formatMessage({ id: "family_tree_row_parents" }),
    rowFamily:        intl.formatMessage({ id: "family_tree_row_family" }),
    rowChildren:      intl.formatMessage({ id: "family_tree_row_children" }),
    rowGrandchildren: intl.formatMessage({ id: "family_tree_row_grandchildren" }),
  };

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const markIfReady = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width > 0 && height > 0) setIsReady(true);
    };
    const ro = new ResizeObserver(markIfReady);
    ro.observe(el);
    markIfReady();
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!containerRef.current || !treeData || !isReady) return;

    const initializeGraph = async () => {
      try {
        const { default: Graph } = await import("graphology");

        // After the await we re-check the cancel flag — a fast re-render of
        // the parent could have torn the effect down while the dynamic import
        // was in flight, and continuing past that point would mount a second
        // graph into a container the previous run hasn't released yet.
        if (cancelledRef.current) return;

        const container = containerRef.current;
        if (!container) return;
        container.innerHTML = "";

        const wrapper = document.createElement("div");
        // overflow:hidden on the wrapper too — when the parent panel is narrower
        // than expected (e.g. before flex settles), absolute children inside
        // the graph container can otherwise paint over the details panel before
        // the inner clip kicks in.
        wrapper.style.cssText = "position: absolute; inset: 0; display: flex; flex-direction: column; overflow: hidden;";

        const toolbar = document.createElement("div");
        // Use the design-system CSS custom property for the container bg so
        // the toolbar matches the rest of the page in dark mode. Falls back
        // to white when the variable is absent (legacy themes).
        // direction is set explicitly here (not inherited) because the graph
        // panel's own container is forced LTR for the camera/coordinate math
        // (see index.js) — that forced LTR would otherwise leak into this
        // toolbar too and make margin-inline-start:auto push the button
        // group to the physical right even in an Arabic/RTL session.
        toolbar.style.cssText = `
          flex: 0 0 52px; padding: 10px 14px;
          border-bottom: 1px solid var(--colorBorderSecondary, #eee);
          display: flex; gap: 12px; align-items: center;
          background: var(--colorBgContainer, #fff);
          color: var(--colorText, #111);
          direction: ${isRtl ? "rtl" : "ltr"};
        `;
        // !important on color/background defends against dark-mode global CSS
        // (e.g. `button { color: var(--colorText) }`) that otherwise wins on
        // specificity even though our inline rules are more local.
        const iconBtnStyle = "background-color:#DAA520 !important;color:#fff !important;border:none;border-radius:6px;padding:6px 10px;font-weight:600;cursor:pointer;min-width:32px;line-height:1;";
        const textBtnStyle = "background-color:#DAA520 !important;color:#fff !important;border:none;border-radius:6px;padding:6px 12px;font-weight:500;cursor:pointer;";
        toolbar.innerHTML = `
          <div style="margin-inline-start: auto; display: flex; gap: 8px;">
            <button id="zoom-out-btn"   title="${LBL.btnZoomOut}" aria-label="${LBL.btnZoomOut}" style="${iconBtnStyle}">−</button>
            <button id="zoom-in-btn"    title="${LBL.btnZoomIn}"  aria-label="${LBL.btnZoomIn}"  style="${iconBtnStyle}">+</button>
            <button id="reset-btn"      style="${textBtnStyle}">${LBL.btnReset}</button>
            <button id="fit-btn"        style="${textBtnStyle}">${LBL.btnFit}</button>
            <button id="fullscreen-btn" style="${textBtnStyle}">${LBL.btnFullscreen}</button>
          </div>
        `;

        const graphContainer = document.createElement("div");
        graphContainer.id = "sigma-container";
        // overflow:hidden is what actually clips the cards. clip-path/contain
        // were tried earlier but they create a new paint+hit-test region that
        // swallowed pan events on the Sigma canvas in some browsers — leaving
        // the cursor as "grab" but no drag. Plain overflow:hidden is enough
        // because we also clamp the camera below so content can't escape.
        // Background routes through the design-system layout token so the
        // canvas matches the rest of the dashboard in both light and dark
        // mode (was a fixed beige that stayed bright in dark mode).
        graphContainer.style.cssText = "flex: 1; position: relative; background: var(--colorBgLayout, #f7f4f1); overflow: hidden !important; touch-action: none; cursor: grab;";

        const fsControls = document.createElement("div");
        fsControls.id = "fs-controls";
        fsControls.style.cssText = `position:absolute;top:10px;${isRtl ? "left" : "right"}:10px;display:none;gap:8px;z-index:1000;pointer-events:auto;direction:${isRtl ? "rtl" : "ltr"};`;
        const fsBtnStyle = "background-color:#DAA520 !important;color:#fff !important;border:none;border-radius:6px;padding:6px 10px;font-weight:500;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,0.15);";
        fsControls.innerHTML = `
          <button id="fs-zoom-out-btn" title="${LBL.btnZoomOut}" aria-label="${LBL.btnZoomOut}" style="${fsBtnStyle};font-weight:600;min-width:32px;line-height:1;">−</button>
          <button id="fs-zoom-in-btn"  title="${LBL.btnZoomIn}"  aria-label="${LBL.btnZoomIn}"  style="${fsBtnStyle};font-weight:600;min-width:32px;line-height:1;">+</button>
          <button id="fs-reset-btn"    style="${fsBtnStyle}">${LBL.btnReset}</button>
          <button id="fs-fit-btn"      style="${fsBtnStyle}">${LBL.btnFit}</button>
          <button id="fs-exit-btn"     style="${fsBtnStyle}">${LBL.btnExit}</button>
        `;
        graphContainer.appendChild(fsControls);

        wrapper.appendChild(toolbar);
        wrapper.appendChild(graphContainer);
        container.appendChild(wrapper);

        await waitForSize(graphContainer).catch(() => {
          tsLog("warn", "Container took too long to size; proceeding anyway.");
        });

        const graph = new Graph({ multi: false, allowSelfLoops: false });
        const adj = buildAdj(treeData);
        const layout = layoutFiveTier(treeData, adj, currentRoot, GAP, Y_TIERS, ID_INLAWS, ID_GPS_M, ID_GPS_F, ID_GCK, expandedClusters, isRtl);
        const idMap = new Map(treeData.nodes.map((n) => [n.id, n]));

        // Per-person avatar: four buckets (citizen male, citizen female,
        // resident male, resident female) sourced from /public. Clusters still
        // use an inline SVG group icon (no real person to render).
        const AVATAR_SRC = {
          citizen_m:  "/citizen/male_icon.jpg",
          citizen_f:  "/citizen/female_icon.jpg",
          resident_m: "/resident/male.png",
          resident_f: "/resident/female.png",
        };
        const imgTag = (src) =>
          `<img src="${src}" alt="" draggable="false" style="width:100%;height:100%;object-fit:cover;display:block;pointer-events:none;" />`;
        const SVG_PEOPLE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="width:100%;height:100%"><circle cx="9" cy="9" r="3"/><circle cx="17" cy="10.5" r="2.4"/><path d="M3 19c0-2.8 2.7-5 6-5s6 2.2 6 5"/><path d="M14 18.4c.4-1.7 2.1-3 4-3s3.6 1.3 4 3"/></svg>`;
        const tint = (hex, alpha) => {
          const m = /^#([0-9a-fA-F]{6})$/.exec(hex || "");
          if (!m) return hex || "transparent";
          const v = parseInt(m[1], 16);
          return `rgba(${(v >> 16) & 255},${(v >> 8) & 255},${v & 255},${alpha})`;
        };

        // ── Branch coloring (multi-wife disambiguation) ──────────────────
        // When the root has 2+ spouses, tag each wife and her descendants
        // with a distinct accent color so the viewer can tell which child
        // belongs to which mother at a glance. Single-wife trees skip this.
        const BRANCH_PALETTE = [
          "#2563EB", // blue
          "#DC2626", // red
          "#059669", // emerald
          "#7C3AED", // violet
          "#DB2777", // pink
          "#0891B2", // cyan
          "#CA8A04", // yellow-700
          "#EA580C", // orange
        ];
        const computeBranchColors = (lay) => {
          const bColor = new Map();
          const wColor = new Map();
          const rootSpouses = Array.from(adj.spousesOf.get(currentRoot) || []);
          const visibleSpouses = rootSpouses.filter((s) => lay.explicitIds.has(s));
          if (visibleSpouses.length < 2) return { branchColorOf: bColor, wifeColorOf: wColor };
          // Sort by laid-out X so colors map to visual left-to-right order.
          visibleSpouses.sort((a, b) => (lay.coords.get(a)?.x ?? 0) - (lay.coords.get(b)?.x ?? 0));
          visibleSpouses.forEach((wifeId, i) => {
            const color = BRANCH_PALETTE[i % BRANCH_PALETTE.length];
            wColor.set(wifeId, color);
            bColor.set(wifeId, color);
          });
          const rootChildren = Array.from(adj.childrenOf.get(currentRoot) || []);
          rootChildren.forEach((cid) => {
            const motherId = Array.from(adj.parentsOf.get(cid) || []).find((p) => wColor.has(p));
            if (motherId) bColor.set(cid, wColor.get(motherId));
          });
          const rootChildrenSet = new Set(rootChildren);
          lay.explicitIds.forEach((id) => {
            if (bColor.has(id)) return;
            const linkParent = Array.from(adj.parentsOf.get(id) || []).find((p) => rootChildrenSet.has(p));
            if (linkParent && bColor.has(linkParent)) bColor.set(id, bColor.get(linkParent));
          });
          return { branchColorOf: bColor, wifeColorOf: wColor };
        };
        let { branchColorOf, wifeColorOf } = computeBranchColors(layout);

        layout.explicitIds.forEach((id) => {
          const c = layout.coords.get(id) || { x: 0, y: 0 };
          graph.addNode(id, { x: c.x * UNIT, y: c.y * UNIT });
        });
        // No Sigma renderer: we draw cards + edges ourselves in SVG/DOM and
        // own the camera. Killing Sigma's involvement removes its mouseCaptor
        // (the cause of "cursor flips to grabbing but tree doesn't move" —
        // Sigma was absorbing the mousedown on graphContainer before our
        // listener got a chance).

        const overlay = document.createElement("div");
        // pointer-events:none on overlay lets mouse events fall through to the
        // Sigma canvas underneath (which is what makes panning + wheel-zoom
        // work). Cards inside re-enable pointer-events for clicks.
        overlay.style.cssText = "position: absolute; inset: 0; pointer-events: none; z-index: 10; overflow: hidden;";
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        svg.setAttribute("overflow", "hidden");
        svg.style.cssText = "position: absolute; inset: 0; overflow: hidden;";
        const nodeLayer = document.createElement("div");
        nodeLayer.style.cssText = "position: absolute; inset: 0; overflow: hidden;";
        overlay.appendChild(svg);
        overlay.appendChild(nodeLayer);
        graphContainer.appendChild(overlay);

        // Faint generation labels along the left edge (Grandparents / Parents /
        // Family / Children / Grandchildren) — orientation aid on dense trees,
        // shown only for tiers that currently have a visible card.
        const rowLabelLayer = document.createElement("div");
        rowLabelLayer.style.cssText = "position: absolute; inset: 0; pointer-events: none; z-index: 5; overflow: hidden;";
        graphContainer.appendChild(rowLabelLayer);

        // ── Independent camera ────────────────────────────────────────────
        // We stopped relying on Sigma's camera + mouseCaptor: between Sigma
        // version quirks, our overlay layer, and the dark-mode CSS, drag was
        // unreliable and zoom-out behavior wasn't deterministic. Sigma still
        // renders (invisible) WebGL placeholder nodes in the background, but
        // every camera operation below — pan, wheel, +/− buttons, fit, and
        // bounds clamping — uses this plain object that we own end to end.
        //
        //   myCamera.x, myCamera.y  : world-space coordinate at the viewport center
        //   myCamera.scale          : pixels per world-unit  (bigger = zoomed in)
        const myCamera = { x: 0, y: 0, scale: 1 };

        const worldToCSSForNode = (id) => {
          const wx = graph.hasNode(id) ? (graph.getNodeAttribute(id, "x") || 0) : 0;
          const wy = graph.hasNode(id) ? (graph.getNodeAttribute(id, "y") || 0) : 0;
          const cw = graphContainer.clientWidth || 800;
          const ch = graphContainer.clientHeight || 600;
          return {
            x: (wx - myCamera.x) * myCamera.scale + cw / 2,
            y: (wy - myCamera.y) * myCamera.scale + ch / 2,
          };
        };

        const drawEdges = () => {
          svg.innerHTML = "";
          const EDGE_R = 12;
          // Every relationship is drawn regardless of where its endpoints sit;
          // SVG overflow:hidden on the parent crops whatever leaks past the
          // panel edge. Earlier we culled edges with off-viewport endpoints
          // and that made connection lines disappear at zoom-out (the
          // off-screen-but-clipped card would still be visible just inside
          // the panel, but the line to it was being skipped).
          layout.edges.forEach((e) => {
            const S = worldToCSSForNode(e.source);
            const T = worldToCSSForNode(e.target);
            const dx = T.x - S.x;
            const dy = T.y - S.y;
            const sameRow = Math.abs(dy) < 1;
            const isInactiveSpouse = e.type === "SPOUSE_OF" && e.relationship_status === "inactive";
            let d;
            if (sameRow && isInactiveSpouse) {
              // Inactive spouse edges (ex / late) arc above the row so they're
              // not visually overpainted by an adjacent active-marriage line
              // on the same Y — the dashed pattern stays clearly visible.
              const midX = (S.x + T.x) / 2;
              const arc = Math.min(40, Math.max(28, Math.abs(dx) * 0.35));
              d = `M ${S.x} ${S.y} Q ${midX} ${S.y - arc} ${T.x} ${T.y}`;
            } else if (Math.abs(dx) < 1 || sameRow) {
              d = `M ${S.x} ${S.y} L ${T.x} ${T.y}`;
            } else {
              const midY = (S.y + T.y) / 2;
              const dirX = Math.sign(dx);
              const dirY = Math.sign(dy);
              const r = Math.max(0, Math.min(EDGE_R, Math.abs(dx) / 2, Math.abs(midY - S.y), Math.abs(T.y - midY)));
              d = `M ${S.x} ${S.y} L ${S.x} ${midY - r * dirY} Q ${S.x} ${midY} ${S.x + r * dirX} ${midY} L ${T.x - r * dirX} ${midY} Q ${T.x} ${midY} ${T.x} ${midY + r * dirY} L ${T.x} ${T.y}`;
            }
            const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
            p.setAttribute("d", d);
            p.setAttribute("fill", "none");
            p.setAttribute("stroke-linecap", "round");
            p.setAttribute("stroke-linejoin", "round");

            if (e.type === "SPOUSE_OF") {
              const wifeColor = wifeColorOf.get(e.source) || wifeColorOf.get(e.target);
              p.setAttribute("stroke", wifeColor || "#DAA520");
              p.setAttribute("stroke-width", "3");
              if (e.relationship_status === "inactive") { p.setAttribute("stroke-dasharray", "6,4"); p.setAttribute("opacity", "0.5"); }
            } else if (e.type === "CHILD_OF") {
              const isMother = e.parent_sex === "F" || e.parent_sex === "f";
              const branchColor = branchColorOf.get(e.source);
              const fallback = isMother ? "#DAA520" : "#aeb4bd";
              p.setAttribute("stroke", branchColor || fallback);
              p.setAttribute("stroke-width", isMother ? "2.5" : "2");
            } else if (e.type === "SIBLING_OF") {
              const srcNode = idMap.get(e.source) || {};
              const tgtNode = idMap.get(e.target) || {};
              const isStep = (srcNode.kin || "").toLowerCase().startsWith("step-") || (tgtNode.kin || "").toLowerCase().startsWith("step-");
              p.setAttribute("stroke", "#aeb4bd");
              p.setAttribute("stroke-width", "2");
              if (isStep) p.setAttribute("stroke-dasharray", "4,3");
            } else if (e.type === "HALF_SIBLING_OF") {
              p.setAttribute("stroke", "#aeb4bd");
              p.setAttribute("stroke-width", "2");
              p.setAttribute("stroke-dasharray", "6,6");
              p.setAttribute("opacity", "0.85");
            } else {
              p.setAttribute("stroke", "#aeb4bd");
              p.setAttribute("stroke-width", "2");
            }
            svg.appendChild(p);
          });
        };

        const drawCards = () => {
          const existing = new Map();
          nodeLayer.querySelectorAll(".ft-card").forEach((el) => existing.set(el.dataset.id, el));
          const used = new Set();

          layout.explicitIds.forEach((id) => {
            const P = worldToCSSForNode(id);
            let el = existing.get(id);
            if (!el) {
              el = document.createElement("div");
              el.className = "ft-card";
              el.dataset.id = id;
              // Every color routes through design-system CSS vars so the card
              // theme-flips along with the rest of the dashboard. The cream
              // backgrounds and #6b7280 metas were previously hardcoded and
              // stayed bright in dark mode.
              el.innerHTML = `
                <div class="ft-avatar-wrap" style="position:relative;flex-shrink:0;">
                  <div class="ft-avatar" style="width:46px;height:46px;border-radius:50%;overflow:hidden;display:flex;align-items:center;justify-content:center;padding:8px;box-sizing:border-box;background:var(--colorFillTertiary, #f3f4f6);color:var(--colorTextSecondary, #6b7280);"></div>
                  <div class="ft-status-dot" style="position:absolute;bottom:-1px;right:-1px;width:12px;height:12px;border-radius:50%;border:2px solid var(--colorBgContainer, #fff);box-sizing:border-box;"></div>
                </div>
                <div class="ft-info" style="line-height:1.3;overflow:hidden;flex:1;min-width:0;">
                  <div class="ft-name" style="font-weight:700;font-size:13.5px;color:var(--colorText, #111827);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"></div>
                  <div class="ft-meta" style="font-size:10.5px;font-weight:600;letter-spacing:0.03em;text-transform:uppercase;color:var(--colorTextSecondary, #6b7280);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"></div>
                </div>
              `;
              nodeLayer.appendChild(el);
            }
            used.add(id);

            const d = idMap.get(id) || {};
            const isCluster = typeof id === "string" && id.startsWith("__cluster_");
            const isSelf = !isCluster && id === currentRoot;

            // Fixed width keeps every card the same size; combined with the
            // grid layout above this guarantees no horizontal overlap.
            const branchColor = branchColorOf.get(id);
            const baseShadow = isSelf
              ? "0 0 0 3px rgba(218,165,32,0.16),0 12px 24px rgba(0,0,0,0.12)"
              : isCluster
                ? "0 4px 12px rgba(180,83,9,0.10)"
                : "0 6px 18px rgba(15,23,42,0.08)";
            const boxShadow = branchColor ? `${baseShadow}, inset 5px 0 0 ${branchColor}` : baseShadow;
            const cardBorder = isSelf
              ? "1.5px solid #DAA520"
              : isCluster
                ? "1.5px dashed #d1a55a"
                : "1px solid var(--colorBorder, #e5e7eb)";
            // All cards share the same container background so dark mode flips
            // them in lockstep with the rest of the page. "Self" and "cluster"
            // get their own visual identity through border style and shadow
            // (already on baseShadow / cardBorder above), not via a different
            // background — a tinted background was the cause of the bright
            // cards left behind in dark mode.
            const cardBg = "var(--colorBgContainer, #ffffff)";
            el.style.cssText = `
              position:absolute; left:${P.x}px; top:${P.y}px; transform:translate(-50%,-50%) scale(${cardScale});
              pointer-events:auto; background:${cardBg};
              border:${cardBorder}; border-radius:16px;
              box-shadow:${boxShadow};
              display:flex; align-items:center; gap:11px; padding:10px 12px 10px ${branchColor ? 16 : 12}px; width:${CARD_WIDTH}px; box-sizing:border-box; cursor:pointer;
              transition:transform 0.15s ease, box-shadow 0.15s ease;
            `;

            el.onclick = async (ev) => {
              ev.preventDefault();
              ev.stopPropagation();

              if (isCluster) {
                const newExpanded = new Set(expandedClusters);
                if (newExpanded.has(id)) newExpanded.delete(id); else newExpanded.add(id);
                setExpandedClusters(newExpanded);
                const newAdj = buildAdj(treeData);
                const newLayout = layoutFiveTier(treeData, newAdj, currentRoot, GAP, Y_TIERS, ID_INLAWS, ID_GPS_M, ID_GPS_F, ID_GCK, newExpanded, isRtl);
                const existingNodes = new Set(graph.nodes());
                const newNodes = new Set(newLayout.explicitIds);
                existingNodes.forEach((nid) => { if (!newNodes.has(nid)) graph.dropNode(nid); });
                newLayout.explicitIds.forEach((nid) => {
                  if (!existingNodes.has(nid)) {
                    const c = newLayout.coords.get(nid) || { x: 0, y: 0 };
                    graph.addNode(nid, { x: c.x * UNIT, y: c.y * UNIT, size: 8, color: "#00000000", type: "circle" });
                  } else {
                    const c = newLayout.coords.get(nid) || { x: 0, y: 0 };
                    graph.setNodeAttribute(nid, "x", c.x * UNIT);
                    graph.setNodeAttribute(nid, "y", c.y * UNIT);
                  }
                });
                Object.assign(layout, newLayout);
                ({ branchColorOf, wifeColorOf } = computeBranchColors(layout));
                centerCamera();
                return;
              }

              const { onPersonSelect: psHandler, onNodeClick: nodeHandler } = handlersRef.current;
              if (id === currentRoot) {
                if (nodeHandler) nodeHandler(id);
                return;
              }
              if (psHandler) {
                tsLog("log", "Navigating to person:", id);
                psHandler(id);
              }
            };

            const isArabic = String(intl.locale || "").toLowerCase().startsWith("ar");
            const fullName = isArabic
              ? (d.name_arabic || d.full_name_ar || d.full_name || d.name || d.label || d.FullName || d.person_name || id)
              : (d.full_name || d.name_eng || d.name || d.label || d.FullName || d.person_name || id);
            const isCitizen = d.person_type === "citizen" || (d.person_type === undefined && d.national_id);
            const isFemale = d.sex && String(d.sex).toUpperCase() === "F";

            // Translate kin label (e.g. "paternal grandfather" → "الجد") with safe fallback.
            const translateKin = (raw) => {
              if (!raw) return "";
              let key = String(raw).toLowerCase().trim().replace(/[\s-]+/g, "_");
              key = key.replace(/^paternal_|^maternal_/, "");
              const id = `family_tree_kin_${key}`;
              const tr = intl.formatMessage({ id, defaultMessage: raw });
              return tr === id ? raw : tr;
            };

            // Inline SVG avatars: gender-aware silhouettes (cluster gets a "people" icon).
            // Background and stroke pick up the branch color when the root has 2+ wives,
            // so each line of descent reads at a glance.
            const avatarEl = el.querySelector(".ft-avatar");
            const palette = isCluster
              ? { bg: "#fef3c7", fg: "#b45309" }
              : isSelf
                ? { bg: "rgba(218,165,32,0.18)", fg: "#b45309" }
                : branchColor
                  ? { bg: tint(branchColor, 0.14), fg: branchColor }
                  : isFemale
                    ? { bg: "#fce7f3", fg: "#db2777" }
                    : { bg: "#dbeafe", fg: "#2563eb" };
            // Avatar key encodes both person_type and sex so the cache busts
            // when either changes (e.g. user navigates to a different person
            // and the same card element is reused for a different bucket).
            const personGroup = isCitizen ? "citizen" : "resident";
            const avatarKind = isCluster ? "cluster" : `${personGroup}_${isFemale ? "f" : "m"}`;
            const targetMarkup = isCluster
              ? SVG_PEOPLE
              : imgTag(AVATAR_SRC[avatarKind]);
            if (avatarEl && avatarEl.dataset.kind !== avatarKind) {
              avatarEl.innerHTML = targetMarkup;
              avatarEl.dataset.kind = avatarKind;
            }
            if (avatarEl) {
              avatarEl.style.background = palette.bg;
              avatarEl.style.color = palette.fg;
              // Real photos read best edge-to-edge; the cluster glyph needs
              // breathing room so it doesn't touch the circular clip.
              avatarEl.style.padding = isCluster ? "9px" : "0px";
            }
            // Small citizen (gold) / resident (green) status dot on the avatar —
            // mirrors the badge colors used in the details panel so the two
            // views read as one system at a glance.
            const statusDot = el.querySelector(".ft-status-dot");
            if (statusDot) {
              if (isCluster) {
                statusDot.style.display = "none";
              } else {
                statusDot.style.display = "block";
                statusDot.style.background = isCitizen ? "#DAA520" : "var(--colorSuccessText, #15803d)";
              }
            }

            const displayName = isCluster
              ? id === ID_GCK ? LBL.grandchildren : id === ID_GPS_F ? LBL.paternalGp : id === ID_GPS_M ? LBL.maternalGp : LBL.inlaws
              : firstWords(fullName, 1);
            const kinText = isCluster
              ? id === ID_GCK ? LBL.grandchildren : id === ID_GPS_F ? LBL.paternalGp : id === ID_GPS_M ? LBL.maternalGp : LBL.inlaws
              : translateKin(d.kin);

            el.querySelector(".ft-name").textContent = displayName;
            el.querySelector(".ft-meta").textContent = kinText;
          });

          existing.forEach((el, id) => { if (!used.has(id)) el.remove(); });
        };

        const ROW_DEFS = [
          { y: Y_TIERS.GP, label: LBL.rowGrandparents },
          { y: Y_TIERS.P, label: LBL.rowParents },
          { y: Y_TIERS.MID, label: LBL.rowFamily },
          { y: Y_TIERS.C, label: LBL.rowChildren },
          { y: Y_TIERS.GC, label: LBL.rowGrandchildren },
        ];
        const drawRowLabels = () => {
          rowLabelLayer.innerHTML = "";
          const ch = graphContainer.clientHeight || 600;
          const EPS = 0.01;
          const explicitIds = Array.from(layout.explicitIds);
          ROW_DEFS.forEach((row) => {
            const hasNode = explicitIds.some((id) => {
              const c = layout.coords.get(id);
              return c && Math.abs(c.y - row.y) < EPS;
            });
            if (!hasNode) return;
            const wy = row.y * UNIT;
            const sy = (wy - myCamera.y) * myCamera.scale + ch / 2;
            if (sy < -20 || sy > ch + 20) return;
            const el = document.createElement("div");
            el.textContent = row.label;
            el.style.cssText = `
              position:absolute; ${isRtl ? "right" : "left"}:14px; top:${sy}px; transform:translateY(-50%);
              font-size:11px; font-weight:700; letter-spacing:${isRtl ? "0" : "0.06em"}; text-transform:uppercase;
              color:var(--colorTextTertiary, #9ca3af); opacity:0.7; white-space:nowrap;
            `;
            rowLabelLayer.appendChild(el);
          });
        };

        const draw = () => { drawEdges(); drawCards(); drawRowLabels(); };

        // ── Camera helpers ────────────────────────────────────────────────
        // The "fit" ratio is the most-zoomed-out we ever want to be. Anything
        // larger than that lets cards drift outside the panel. We compute it on
        // demand, then clamp every camera update to [minRatio, fitRatio].
        const computeFit = () => {
          const ids = Array.from(layout.explicitIds);
          const b = boundsFromCoords(layout.coords, new Set(ids));
          const cw = graphContainer.clientWidth || 800;
          const ch = graphContainer.clientHeight || 600;
          // Reserve a full card-width of padding on each side so leftmost and
          // rightmost cards (which are anchored at their centers) sit fully
          // inside the panel — not pressed against the edges of the details
          // panel border.
          const padPx = CARD_WIDTH * 1.0;
          const dx = Math.max(1e-6, (b.maxX - b.minX) * UNIT) + padPx * 2;
          const dy = Math.max(1e-6, (b.maxY - b.minY) * UNIT) + 120;
          const margin = 0.18;
          const ratio = Math.max(dx / (cw * (1 - margin)), dy / (ch * (1 - margin)), 0.0001);
          // Cards are fixed-pixel-width regardless of zoom, so zooming out far
          // enough can shrink the on-screen gap between same-row siblings below
          // CARD_WIDTH — the cards would start visually overlapping even though
          // their world-space grid slots never crossed. Rather than clamping
          // `ratio` (which used to leave wide trees zoomed in too far to fit,
          // clipped by overflow:hidden), shrink the cards proportionally so the
          // full tree still fits at this ratio without overlapping.
          const cardScale = Math.max(CARD_MIN_SCALE, Math.min(1, NO_OVERLAP_MAX_RATIO / ratio));
          return { ratio, cx: b.cx * UNIT, cy: b.cy * UNIT, cardScale };
        };

        // scale = pixels per world unit. fitScale is computed by centerCamera
        // so that every card is fully inside the viewport (with the configured
        // Zoom range: generous in both directions so big trees (50+ nodes)
        // remain navigable. Zoom-out shrinks everything further than fit so
        // the user can survey the whole tree at once; zoom-in goes 2.5× past
        // fit so individual names stay readable on dense layouts. The
        // position clamp below uses a soft margin (vs. the previous "every
        // card fully inside") so panning at zoom-in feels free — edge cards
        // are allowed to overshoot the panel edge by up to ~70 % of their
        // width before the camera resists further. overflow:hidden still
        // hides anything that crosses the panel boundary.
        let fitScale = 1;
        // Card shrink factor applied at the last fit (1 = full size). Wide
        // trees that need to zoom out past NO_OVERLAP_MAX_RATIO to fit get a
        // smaller value here instead of being clipped — see computeFit().
        let cardScale = 1;
        const SCALE_MIN_FACTOR = 0.5;
        const SCALE_MAX_FACTOR = 2.5;
        // Hard floor derived the same way as NO_OVERLAP_MAX_RATIO above: never
        // let manual zoom-out (the − button / wheel) shrink same-row spacing
        // below a card-width + margin, accounting for the current cardScale
        // (smaller cards tolerate zooming out further before overlapping).
        const scaleMin = () => Math.max(fitScale * SCALE_MIN_FACTOR, cardScale / NO_OVERLAP_MAX_RATIO);
        const scaleMax = () => fitScale * SCALE_MAX_FACTOR;

        // contentBounds: world-space bbox of all currently-laid-out nodes.
        // const contentBounds = () => {
        //   const b = boundsFromCoords(layout.coords, layout.explicitIds);
        //   return {
        //     minX: b.minX * UNIT, maxX: b.maxX * UNIT,
        //     minY: b.minY * UNIT, maxY: b.maxY * UNIT,
        //     cx: b.cx * UNIT, cy: b.cy * UNIT,
        //   };
        // };

        // Soft border clamp. Earlier the rule was "no card may ever be
        // partially clipped" — that required a fully-rigid camera, which on
        // big trees left no pan room and made zoom-in feel locked. Now we
        // only require ~30 % of a card's width/height to stay inside the
        // viewport; the rest can drift past the panel edge (overflow:hidden
        // crops what spills). That preserves the "tree never disappears off
        // screen" guarantee while giving the user real pan freedom on dense
        // graphs.
        // const CARD_HALF_W = CARD_WIDTH / 2 + 8;
        // const CARD_HALF_H = 30 + 8;
        // const SAFE_FRACTION = 0.3;
        // const clampPosition = () => {
        //   const cb = contentBounds();
        //   const cw = graphContainer.clientWidth || 800;
        //   const ch = graphContainer.clientHeight || 600;
        //   const halfVwWorld = (cw / 2) / myCamera.scale;
        //   const halfVhWorld = (ch / 2) / myCamera.scale;
        //   const safeX = (CARD_HALF_W * SAFE_FRACTION) / myCamera.scale;
        //   const safeY = (CARD_HALF_H * SAFE_FRACTION) / myCamera.scale;
        //   const cxMin = cb.maxX - halfVwWorld + safeX;
        //   const cxMax = cb.minX + halfVwWorld - safeX;
        //   if (cxMin > cxMax) {
        //     myCamera.x = cb.cx;
        //   } else {
        //     myCamera.x = Math.min(Math.max(myCamera.x, cxMin), cxMax);
        //   }
        //   const cyMin = cb.maxY - halfVhWorld + safeY;
        //   const cyMax = cb.minY + halfVhWorld - safeY;
        //   if (cyMin > cyMax) {
        //     myCamera.y = cb.cy;
        //   } else {
        //     myCamera.y = Math.min(Math.max(myCamera.y, cyMin), cyMax);
        //   }
        // };
        const clampPosition = () => {};

        const centerCamera = () => {
          const f = computeFit();
          // f.ratio = world units per pixel; we store pixels per world unit instead.
          fitScale = 1 / f.ratio;
          cardScale = f.cardScale;
          myCamera.scale = fitScale;
          myCamera.x = f.cx;
          myCamera.y = f.cy;
          draw();
        };

        const zoomBy = (factor) => {
          const next = Math.min(Math.max(myCamera.scale * factor, scaleMin()), scaleMax());
          if (next === myCamera.scale) return;
          myCamera.scale = next;
          clampPosition();
          draw();
        };

        const zoomAround = (newScale, mx, my) => {
          const clamped = Math.min(Math.max(newScale, scaleMin()), scaleMax());
          if (clamped === myCamera.scale) return;
          const cw = graphContainer.clientWidth || 800;
          const ch = graphContainer.clientHeight || 600;
          // World point currently under the cursor
          const wx = (mx - cw / 2) / myCamera.scale + myCamera.x;
          const wy = (my - ch / 2) / myCamera.scale + myCamera.y;
          myCamera.scale = clamped;
          // Shift camera so the same world point stays under the cursor
          myCamera.x = wx - (mx - cw / 2) / myCamera.scale;
          myCamera.y = wy - (my - ch / 2) / myCamera.scale;
          clampPosition();
          draw();
        };

        // ── Drag-to-pan ───────────────────────────────────────────────────
        let dragState = null;
        const onMouseDown = (e) => {
          if (e.button !== 0) return;
          if (e.target && e.target.closest && e.target.closest(".ft-card")) return;
          dragState = {
            mx: e.clientX, my: e.clientY,
            cx: myCamera.x, cy: myCamera.y,
          };
          graphContainer.style.cursor = "grabbing";
          e.preventDefault();
        };
        const onMouseMove = (e) => {
          if (!dragState) return;
          const dx = (e.clientX - dragState.mx) / myCamera.scale;
          const dy = (e.clientY - dragState.my) / myCamera.scale;
          myCamera.x = dragState.cx - dx;
          myCamera.y = dragState.cy - dy;
          clampPosition();
          draw();
        };
        const onMouseUp = () => {
          if (!dragState) return;
          dragState = null;
          graphContainer.style.cursor = "grab";
        };
        const onWheel = (e) => {
          e.preventDefault();
          const rect = graphContainer.getBoundingClientRect();
          const mx = e.clientX - rect.left;
          const my = e.clientY - rect.top;
          // scroll up → zoom in (bigger scale)
          const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
          zoomAround(myCamera.scale * factor, mx, my);
        };

        graphContainer.addEventListener("mousedown", onMouseDown);
        window.addEventListener("mousemove", onMouseMove);
        window.addEventListener("mouseup", onMouseUp);
        graphContainer.addEventListener("wheel", onWheel, { passive: false });

        // First fit uses the now-stable container size. We don't subscribe to
        // Sigma's afterRender or camera.updated anymore — every camera mutation
        // calls draw() itself, so cards/edges always match myCamera in lockstep.
        setTimeout(() => { centerCamera(); }, 50);

        // Note on direction: myCamera.scale is PIXELS PER WORLD UNIT, so
        // *bigger* scale = more zoomed IN. Factor 1.4 zooms in, 0.7 zooms out.
        // (Opposite of Sigma's ratio, which used to back this UI.)
        document.getElementById("zoom-in-btn")?.addEventListener("click", () => zoomBy(1.4));
        document.getElementById("zoom-out-btn")?.addEventListener("click", () => zoomBy(0.7));
        document.getElementById("reset-btn")?.addEventListener("click", centerCamera);
        document.getElementById("fit-btn")?.addEventListener("click", centerCamera);
        document.getElementById("fullscreen-btn")?.addEventListener("click", () => {
          if (!graphContainer || !graphContainer.isConnected) return;
          if (!document.fullscreenElement) {
            graphContainer.requestFullscreen?.().then(() => setTimeout(() => { centerCamera(); }, 50)).catch(() => {});
          } else {
            document.exitFullscreen?.().catch(() => {});
          }
        });
        document.getElementById("fs-zoom-in-btn")?.addEventListener("click", () => zoomBy(1.4));
        document.getElementById("fs-zoom-out-btn")?.addEventListener("click", () => zoomBy(0.7));
        document.getElementById("fs-reset-btn")?.addEventListener("click", centerCamera);
        document.getElementById("fs-fit-btn")?.addEventListener("click", centerCamera);
        document.getElementById("fs-exit-btn")?.addEventListener("click", () => document.exitFullscreen?.().catch(() => {}));

        const syncFsVisibility = () => {
          fsControls.style.display = document.fullscreenElement === graphContainer ? "flex" : "none";
        };
        document.addEventListener("fullscreenchange", syncFsVisibility);
        syncFsVisibility();

        const handleResize = () => { centerCamera(); };
        window.addEventListener("resize", handleResize);

        // ResizeObserver on the graph container itself catches the cases
        // window resize doesn't: side-panel collapsing, flex finally settling
        // after first paint (the panel can be 800 wide on the first measure
        // and 1225 wide a frame later — without re-fitting, the tree ends up
        // placed for an 800-wide viewport and looks left-of-center).
        let lastW = graphContainer.clientWidth;
        let lastH = graphContainer.clientHeight;
        const containerRO = new ResizeObserver(() => {
          const w = graphContainer.clientWidth;
          const h = graphContainer.clientHeight;
          if (w === lastW && h === lastH) return;
          lastW = w; lastH = h;
          centerCamera();
        });
        containerRO.observe(graphContainer);

        tsLog("log", "Graph initialized successfully");

        // Stash the listener-removal closure on containerRef so the outer
        // effect-cleanup can find and call it. Listeners attached to the
        // graphContainer itself (mousedown, wheel) are GC'd when the container
        // is replaced on re-init, so they don't need explicit removal.
        if (containerRef.current) {
          containerRef.current.__ftCleanup = () => {
            document.removeEventListener("fullscreenchange", syncFsVisibility);
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
            try { containerRO.disconnect(); } catch (_) { /* already gone */ }
          };
        }
      } catch (err) {
        if (cancelledRef.current) return;
        tsLog("error", "Error initializing graph:", err);
        setError(intl.formatMessage({ id: "family_tree_load_error" }));
      }
    };

    cancelledRef.current = false;
    initializeGraph();

    return () => {
      cancelledRef.current = true;
      const c = containerRef.current;
      if (c) {
        try { c.__ftCleanup?.(); } catch (_) { /* listeners may not have been wired yet */ }
        c.__ftCleanup = null;
        c.innerHTML = "";
      }
    };
    // LBL.* and the prop handlers are intentionally NOT in the dep array — locale
    // changes already trigger a re-mount higher up, and handler-ref changes flow
    // through handlersRef without forcing a Sigma rebuild.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [treeData, currentRoot, isReady, expandedClusters]);

  if (error) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "var(--colorError, #dc2626)", marginBottom: "8px" }}>{error}</p>
          <p style={{ fontSize: "14px", color: "var(--colorTextSecondary, #6b7280)" }}>{intl.formatMessage({ id: "family_tree_load_error_hint" })}</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", minHeight: "480px", position: "relative", overflow: "hidden" }} />
  );
}
