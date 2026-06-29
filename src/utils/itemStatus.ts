import { GigItem } from '../types';

/** An item is complete when it's packed OR already on-site. */
export const isComplete = (item: GigItem): boolean => item.checked || !!item.onSite;
