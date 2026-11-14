const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export async function getFollowUps() {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/follow-ups`);
  } catch {
    throw new Error('Could not reach the server. Please try again.');
  }

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.error || 'Could not load follow-ups.');
  }

  return result;
}

export async function createFollowUp(followUp) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/follow-ups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(followUp),
    });
  } catch {
    throw new Error('Could not reach the server. Please try again.');
  }

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    const fieldErrors = result.details ? Object.values(result.details).join(' ') : '';
    throw new Error(fieldErrors || result.error || 'Could not create the follow-up.');
  }

  return result;
}

export async function updateFollowUp(id, followUp) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/follow-ups/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(followUp),
    });
  } catch {
    throw new Error('Could not reach the server. Please try again.');
  }

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    const fieldErrors = result.details ? Object.values(result.details).join(' ') : '';
    throw new Error(fieldErrors || result.error || 'Could not update the follow-up.');
  }

  return result;
}

export async function deleteFollowUp(id) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/follow-ups/${id}`, {
      method: 'DELETE',
    });
  } catch {
    throw new Error('Could not reach the server. Please try again.');
  }

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.error || 'Could not delete the follow-up.');
  }

  return result;
}
