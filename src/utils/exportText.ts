import { Platform, Share } from 'react-native';
import { GigChecklist, GigItem } from '../types';
import { isComplete } from './itemStatus';

/** Render a checklist as plain text suitable for messages, notes, or printing. */
export function buildExportText(list: GigChecklist): string {
  const lines: string[] = [list.name, ''];

  const renderItems = (items: GigItem[]) => {
    items.forEach((i) => {
      const box = isComplete(i) ? '[x]' : '[ ]';
      const qty = i.quantity && i.quantity > 1 ? ` x${i.quantity}` : '';
      const onSite = i.onSite ? ' (on-site)' : '';
      const note = i.note ? ` - ${i.note}` : '';
      lines.push(`${box} ${i.label}${qty}${onSite}${note}`);
    });
  };

  list.categories.forEach((cat) => {
    const items = list.items.filter((it) => it.categoryId === cat.id);
    if (items.length === 0) return;
    lines.push(cat.name.toUpperCase());
    renderItems(items);
    lines.push('');
  });

  const uncategorised = list.items.filter(
    (it) => !list.categories.find((c) => c.id === it.categoryId)
  );
  if (uncategorised.length > 0) {
    lines.push('OTHER');
    renderItems(uncategorised);
    lines.push('');
  }

  const ready = list.items.filter(isComplete).length;
  lines.push(`${ready}/${list.items.length} ready`);
  return lines.join('\n');
}

/**
 * Share the list. Native opens the OS share sheet; web uses the Web Share API
 * when available, otherwise copies to the clipboard. `onResult` reports a short
 * message for web (where there's no native sheet) so the caller can show a toast.
 */
export async function shareListText(
  list: GigChecklist,
  onResult?: (message: string) => void
): Promise<void> {
  const text = buildExportText(list);

  if (Platform.OS === 'web') {
    const nav: any = typeof navigator !== 'undefined' ? navigator : undefined;
    if (nav?.share) {
      try {
        await nav.share({ title: list.name, text });
        return;
      } catch (e: any) {
        if (e?.name === 'AbortError') return; // user dismissed the share sheet
      }
    }
    try {
      await nav?.clipboard?.writeText(text);
      onResult?.('Copied to clipboard');
    } catch {
      onResult?.('Could not copy');
    }
    return;
  }

  try {
    await Share.share({ message: text, title: list.name });
  } catch {
    // share dismissed or failed — nothing to do
  }
}
