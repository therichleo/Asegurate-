const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const getAuthHeader = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

export const apiClient = {
  async createServiceRequest(token, body) {
    const res = await fetch(`${API_URL}/api/services`, {
      method: 'POST',
      headers: getAuthHeader(token),
      body: JSON.stringify(body),
    });
    return res.json();
  },

  async getMyRequests(token) {
    const res = await fetch(`${API_URL}/api/services/mis-solicitudes`, {
      headers: getAuthHeader(token),
    });
    return res.json();
  },

  async getAllRequests(token) {
    const res = await fetch(`${API_URL}/api/services/admin/todas`, {
      headers: getAuthHeader(token),
    });
    return res.json();
  },

  async approveRequest(token, id) {
    const res = await fetch(`${API_URL}/api/services/admin/${id}/aprobar`, {
      method: 'PATCH',
      headers: getAuthHeader(token),
    });
    return res.json();
  },

  async initWebpay(token, request_id) {
    const res = await fetch(`${API_URL}/api/webpay/init`, {
      method: 'POST',
      headers: getAuthHeader(token),
      body: JSON.stringify({ request_id }),
    });
    return res.json();
  },

  async confirmWebpay(token_ws) {
    const res = await fetch(`${API_URL}/api/webpay/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token_ws }),
    });
    return res.json();
  },

  async getPdfUrl(token, id) {
    const res = await fetch(`${API_URL}/api/services/${id}/pdf`, {
      headers: getAuthHeader(token),
    });
    return res.json();
  },
};
