import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV();

export const ONBOARDING_KEY = 'has_seen_onboarding';

export const setHasSeenOnboarding = () => {
  storage.set(ONBOARDING_KEY, true);
};

export const getHasSeenOnboarding = () => {
  return storage.getBoolean(ONBOARDING_KEY) || false;
};
