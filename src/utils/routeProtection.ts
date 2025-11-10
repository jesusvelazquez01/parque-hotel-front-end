
// Simple route protection utility to prevent direct URL access to certain pages
// Uses localStorage to maintain state across page refreshes
// This enables the "back button" functionality while maintaining security checks
// Last updated: May 18, 2025

export const PROTECTED_ROUTES = {
  ROOM_DETAIL: 'room_detail_access'
};

export const setRouteAccess = (routeKey: string, roomId?: string): void => {
  const value = roomId ? `${routeKey}_${roomId}` : routeKey;
  localStorage.setItem(routeKey, value);
  
  // Set expiration (15 minutes)
  const expiration = Date.now() + 15 * 60 * 1000;
  localStorage.setItem(`${routeKey}_expiration`, expiration.toString());
};

export const checkRouteAccess = (routeKey: string, roomId?: string): boolean => {
  const storedValue = localStorage.getItem(routeKey);
  const expiration = localStorage.getItem(`${routeKey}_expiration`);
  
  // Check if access has expired
  if (expiration && parseInt(expiration) < Date.now()) {
    localStorage.removeItem(routeKey);
    localStorage.removeItem(`${routeKey}_expiration`);
    return false;
  }
  
  if (!storedValue) return false;
  
  // If roomId is provided, check if it matches the stored value
  if (roomId) {
    return storedValue === `${routeKey}_${roomId}`;
  }
  
  return true;
};

export const clearRouteAccess = (routeKey: string): void => {
  localStorage.removeItem(routeKey);
  localStorage.removeItem(`${routeKey}_expiration`);
};
