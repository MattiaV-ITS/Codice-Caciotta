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

    // Store token and user data
    return {
      token: data.accessToken || data.token,
      user: {
        id: data.id,
        username: data.username,
        email: data.email,
        roles: data.roles,
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

  isAuthenticated() {
    return !!this.getToken();
  }
}

export default new AuthService();
