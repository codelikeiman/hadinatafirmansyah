/**
 * Builder state proyek Theatre.js (format on-disk definitionVersion 0.4.0).
 *
 * Theatre biasanya menyimpan keyframe hasil editing di Studio ke file JSON.
 * Di sini keyframe ditulis sebagai data ringkas lalu dikonversi ke format
 * resmi itu, jadi animasi jalan di production TANPA Studio. Di mode dev,
 * buka /#/history?studio untuk mengedit timeline secara visual lalu
 * export state-nya.
 *
 * objects: { ObjectKey: { prop: [[position, value], ...] } }
 */
const EASE_IN_OUT = [0.5, 1, 0.5, 0]; // [leftX, leftY, rightX, rightY] → cubic-bezier(.5,0,.5,1)

export function buildProjectState(sheetId, length, objects) {
  let n = 0;
  const tracksByObject = {};
  for (const [objKey, props] of Object.entries(objects)) {
    const trackData = {};
    const trackIdByPropPath = {};
    for (const [prop, frames] of Object.entries(props)) {
      const trackId = `${objKey}-${prop}`.replace(/[^\w-]/g, "_");
      trackIdByPropPath[JSON.stringify([prop])] = trackId;
      trackData[trackId] = {
        type: "BasicKeyframedTrack",
        __debugName: `${objKey}:${prop}`,
        keyframes: [...frames]
          .sort((a, b) => a[0] - b[0])
          .map(([position, value, ease]) => ({
            id: `kf${n++}`,
            position,
            value,
            handles: ease ?? EASE_IN_OUT,
            connectedRight: true,
            type: "bezier",
          })),
      };
    }
    tracksByObject[objKey] = { trackData, trackIdByPropPath };
  }
  return {
    sheetsById: {
      [sheetId]: {
        staticOverrides: { byObject: {} },
        sequence: { type: "PositionalSequence", length, subUnitsPerUnit: 30, tracksByObject },
      },
    },
    definitionVersion: "0.4.0",
    revisionHistory: [],
  };
}
