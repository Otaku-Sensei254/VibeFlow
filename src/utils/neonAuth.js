import { authClient } from '../lib/auth-client';

export async function signInWithEmail(email, password) {
  try {
    const result = await authClient.signIn.email({ email, password });
    return result;
  } catch (error) {
    throw error;
  }
}

export async function signUpWithEmail(email, password, name) {
  try {
    const result = await authClient.signUp.email({ email, password, name });
    return result;
  } catch (error) {
    throw error;
  }
}

export async function signInWithGoogle(callbackURL = window.location.origin + '/auth/callback') {
  try {
    const result = await authClient.signIn.social({ provider: 'google', callbackURL });
    return result;
  } catch (error) {
    throw error;
  }
}

export async function signOutNeon() {
  try {
    return await authClient.signOut();
  } catch (error) {
    throw error;
  }
}

export async function getNeonSession() {
  try {
    return await authClient.getSession();
  } catch (error) {
    return null;
  }
}

export { authClient };

const neonAuthUtils = {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signOutNeon,
  getNeonSession,
  authClient
};

export default neonAuthUtils;
