const API_URL = '/api/auth';

class AuthService {
  async signup(username, email, password, role = ['user']) {
    const response = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password, role }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Signup failed');
    }

    return data;
  }

  async login(username, password) {
    const response = await fetch(`${API_URL}/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // Salva il token e i dati dell'utente nel localStorage
    return {
      token: data.accessToken || data.token,
      user: {
        id: data.id,
        username: data.username,
        email: data.email,
        roles: data.roles,
        proprietarioId: data.proprietarioId,
      },
    };
  }

  logout() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('userData');
  }

  getToken() {
    return localStorage.getItem('jwtToken');
  }

  getUser() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }

  async getCurrentUser() {
    const response = await fetch(`${API_URL}/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getToken()}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get current user');
    }

    return {
      user: {
        id: data.id,
        username: data.username,
        email: data.email,
        roles: data.roles,
        proprietarioId: data.proprietarioId,
      },
    };
  }

  isAuthenticated() {
    return !!this.getToken();
  }
}

export default new AuthService();
