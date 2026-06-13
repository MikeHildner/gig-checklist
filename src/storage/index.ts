import AsyncStorage from '@react-native-async-storage/async-storage';
import { GigChecklist } from '../types';
import { defaultChecklists } from '../constants/defaults';

const STORAGE_KEY = 'gig_checklists_v1';

export async function loadChecklists(): Promise<GigChecklist[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (raw === null) {
    await saveChecklists(defaultChecklists);
    return defaultChecklists;
  }
  return JSON.parse(raw) as GigChecklist[];
}

export async function saveChecklists(lists: GigChecklist[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
}
