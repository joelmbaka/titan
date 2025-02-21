type User = {
  id: string;
  name: string;
  email: string;
  image: string;
  emailVerified: Date;
};

type Session = {
  id: string;
  userId: string;
  expires: Date;
  sessionToken: string;
  accessToken: string;
};

type Account = {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refreshToken: string;
  accessToken: string;
  expiresAt: number;
  tokenType: string;
  scope: string;
  idToken: string;
  sessionState: string;
  user: User;
};

type VerificationToken = {
  id: string;
  identifier: string;
  token: string;
  expires: Date;
};

type BusinessProfile = {
  id: string;
  userId: string;
  name: string;
  description: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
};

type BusinessProfileImage = {
  id: string;
  businessProfileId: string;
  url: string;
  createdAt: Date;
  updatedAt: Date;
};


export type { User, Session, Account, VerificationToken, BusinessProfile, BusinessProfileImage };
