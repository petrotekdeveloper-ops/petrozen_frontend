export function getAdminToken() {
  return localStorage.getItem("admin_token");
}

export function setAdminToken(token) {
  localStorage.setItem("admin_token", token);
}

export function clearAdminToken() {
  localStorage.removeItem("admin_token");
}

