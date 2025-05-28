

export function isLoggedIn() {
  return !!sessionStorage.getItem('token');
}

export function getUserRole() {
  return sessionStorage.getItem('role');
}

export function getUserName() {
  return sessionStorage.getItem('userName');
}

