import { SignJWT, jwtVerify } from 'jose';
import { JWT_EXPIRES_IN } from './constants';

export type JwtPayload = {
  userId: number;
  username: string;
  email: string;
};

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      'JWT_SECRET manquant ou trop court (min. 16 caractères). Voir .env.example.',
    );
  }
  return new TextEncoder().encode(secret);
}

export async function signAccessToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({
    username: payload.username,
    email: payload.email,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(payload.userId))
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(getSecret());
}

export async function verifyAccessToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, getSecret());
  const userId = Number(payload.sub);
  if (!userId || Number.isNaN(userId)) {
    throw new Error('Token invalide');
  }
  return {
    userId,
    username: String(payload.username ?? ''),
    email: String(payload.email ?? ''),
  };
}
