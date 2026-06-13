import { GigChecklist } from '../types';
import { uuid } from '../utils/uuid';

function makeList(name: string, data: Record<string, string[]>): GigChecklist {
  const categories = Object.keys(data).map((name) => ({ id: uuid(), name }));
  const items = categories.flatMap((cat) =>
    data[cat.name].map((label) => ({
      id: uuid(),
      label,
      categoryId: cat.id,
      checked: false,
    }))
  );
  return { id: uuid(), name, categories, items, createdAt: Date.now() };
}

export const defaultChecklists: GigChecklist[] = [
  makeList('Jazz Gig', {
    Instruments: ['Saxophone', 'Mouthpiece', 'Reeds (x4)', 'Ligature', 'Neck strap', 'Reed case'],
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
];
