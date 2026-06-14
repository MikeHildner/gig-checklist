import { GigChecklist, GigItem } from '../types';
import { uuid } from '../utils/uuid';

// An item is either a plain label or an object with quantity/note. A trailing
// "(xN)" in any label is moved into the quantity, e.g. "Reeds (x4)" → Reeds ×4.
type ItemSpec = string | { label: string; quantity?: number; note?: string };

function makeItem(spec: ItemSpec, categoryId: string): GigItem {
  const base: { label: string; quantity?: number; note?: string } =
    typeof spec === 'string' ? { label: spec } : spec;
  let label = base.label;
  let quantity = base.quantity;

  const match = label.match(/\s*\(x(\d+)\)\s*$/i);
  if (match) {
    quantity = quantity ?? parseInt(match[1], 10);
    label = label.slice(0, match.index).trim();
  }

  return {
    id: uuid(),
    label,
    categoryId,
    checked: false,
    quantity: quantity && quantity > 1 ? quantity : undefined,
    note: base.note?.trim() ? base.note.trim() : undefined,
  };
}

function makeList(name: string, data: Record<string, ItemSpec[]>): GigChecklist {
  const categories = Object.keys(data).map((catName) => ({ id: uuid(), name: catName }));
  const items = categories.flatMap((cat) =>
    data[cat.name].map((spec) => makeItem(spec, cat.id))
  );
  return { id: uuid(), name, categories, items, createdAt: Date.now() };
}

export const defaultChecklists: GigChecklist[] = [
  makeList('Jazz Gig', {
    Instruments: [
      { label: 'Saxophone', note: 'The Eb one!' },
      'Mouthpiece',
      'Reeds (x4)',
      'Ligature',
      'Neck strap',
      'Reed case',
    ],
    Cables: ['XLR mic cable', '1/4" instrument cable', 'DI box'],
    Power: ['Power strip', 'Extension cord'],
    Accessories: [
      'Music stand',
      'Stand light',
      'Charts / band folder',
      'Setlist',
      'Earplugs',
      'Tuner / metronome',
    ],
  }),
  makeList('Rock Rehearsal', {
    Instruments: ['Guitar', 'Picks (x10)', 'Capo', 'Clip-on tuner', 'Slide'],
    Cables: ['Guitar cable (x2)', 'Patch cables (x4)', 'Pedalboard power supply'],
    Power: ['Power strip'],
    Accessories: [
      'Extra strings (x2)',
      'String winder',
      'Notebook / lyrics',
      'Earplugs',
      'Phone stand',
    ],
  }),
  makeList('Mike\'s List', {
    PreGig: ['Charge IEM', 'Charge iPad for Songs', 'Charge iPad for Mixer', 'Charge Page Turner', 'Charge Video Camera', 'Charge Bluetooth Receiver'],
    Keyboard: ['Keyboard', 'Power Cable', 'Stand', 'Cabinet Jacks', 'Wood Board', '1/4" Cables (x2)', 'Sustain Pedal (x2)'],
    IEM: ['Transmitter', 'Receiver', 'Ears', 'XLR to 1/4" Adapter'],
    Mixer: ['Mixer', 'Power Cable', 'Bluetooth Receiver'],
    Mic: ['Vocal mic', 'Mic stand', 'XLR cable'],
    Power: ['Power strip'],
    iPads: ['iPad for Songs', 'iPad for Mixer'],
    Gig: ['Extension Cord', 'Power Cable (x2)', '1/4" Cables (x2)', 'XLR Cable'],
    Nighttime: ['Keyboard Lights'],
    Accessories: [
      'iPad Holder for Songs',
      'iPad Holder for Mixer',
      'Tambourine',
      'Drink Holder',
      'Money Gun',
      'Keyboard Stool',
    ],
  }),
];
