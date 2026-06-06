import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";

const BIOMETRIC_ENABLED_KEY = "veloxlane_biometric_enabled";

export async function isBiometricEnabled(): Promise<boolean> {
  const value = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
  return value === "true";
}

export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  if (enabled) {
    await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, "true");
    return;
  }

  await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
}

export async function promptBiometricUnlock(): Promise<boolean> {
  const enabled = await isBiometricEnabled();
  if (!enabled) {
    return true;
  }

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: "Unlock VeloxLane",
    cancelLabel: "Use password",
    disableDeviceFallback: false,
  });

  return result.success;
}

export async function canEnableBiometric(): Promise<boolean> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) {
    return false;
  }

  return LocalAuthentication.isEnrolledAsync();
}
