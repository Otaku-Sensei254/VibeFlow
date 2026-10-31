import { createInternalNeonAuth } from '@neondatabase/auth';

const neonAuth = createInternalNeonAuth(
  process.env.REACT_APP_NEON_AUTH_URL || 'https://ep-dawn-star-a4b5sxja.neonauth.us-east-1.aws.neon.tech/neondb/auth'
);

export const authClient = neonAuth.adapter;
export const getNeonJWT = neonAuth.getJWTToken;

export default authClient;
