import * as LocalAuthentication from "expo-local-authentication";
import * as Notifications from "expo-notifications";

/** Stub — full biometric gate wired in P1.06. */
export async function ensureBiometricAvailability(): Promise<boolean> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) {
    return false;
  }

  return LocalAuthentication.isEnrolledAsync();
}

/** Stub — push registration wired in P1.18. */
export async function requestNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();

  if (current.granted) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

/** Called on app boot to prime permission state without blocking UI. */
export async function bootstrapPermissions(): Promise<void> {
  await Promise.all([
    ensureBiometricAvailability(),
    requestNotificationPermission(),
  ]);
}
