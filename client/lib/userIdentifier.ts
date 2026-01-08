/**
 * User Identifier Utility
 * Generates and stores a unique identifier for each user/device
 * This identifier is used to track likes and comments without requiring authentication
 */

const STORAGE_KEY = "blog_user_identifier";

/**
 * Generate a unique user identifier based on browser/device info
 * Uses a combination of browser fingerprinting and localStorage
 */
export function generateUserIdentifier(): string {
  // Try to get existing identifier from localStorage
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) {
    return existing;
  }

  // Generate new identifier
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + "x" + screen.height,
    new Date().getTime().toString(),
    Math.random().toString(36).substring(2, 15),
  ];

  const identifier = btoa(components.join("|"))
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, 32);

  // Store in localStorage
  localStorage.setItem(STORAGE_KEY, identifier);

  return identifier;
}

/**
 * Get the current user identifier (generate if doesn't exist)
 */
export function getUserIdentifier(): string {
  return generateUserIdentifier();
}

/**
 * Get device info for activity logging
 */
export function getDeviceInfo(): string {
  return JSON.stringify({
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenResolution: `${screen.width}x${screen.height}`,
  });
}
