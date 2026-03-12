const PREFIX = "profile_pic_";

export function getProfilePic(clientId: string): string | null {
  return localStorage.getItem(PREFIX + clientId);
}

export function setProfilePic(clientId: string, base64: string): void {
  localStorage.setItem(PREFIX + clientId, base64);
}

export function removeProfilePic(clientId: string): void {
  localStorage.removeItem(PREFIX + clientId);
}
