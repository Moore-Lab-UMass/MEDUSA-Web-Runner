// Every color the results plots draw with, named for what it marks rather than where, so a gene,
// a control or the simulation reads the same in the phase diagram and the histogram.
export const PLOT_COLORS = {
  // A gene picked out: the phase diagram's top hits and gene_list genes, the histogram's gene.
  highlight: '#5b3fa8',
  // The ring around a highlighted point, which keeps it legible over the surface's darkest colors.
  highlightRing: '#ffffff',
  // The non-targeting controls.
  control: '#4b5563',
  // Every other gene.
  background: '#9aa1a9',
  // Axis labels and tick labels.
  axisText: '#1c1917',
} as const;

// The phase diagram's surface, from the lowest L2FC to the highest: blue to red, as MEDUSA's own
// plot colors it, but muted, and with the two arms matched step for step in lightness so neither
// end reads louder.
export const SURFACE_COLORS = ['#4393c3', '#92c5de', '#f7f7f7', '#f4a582', '#d6604d'];
