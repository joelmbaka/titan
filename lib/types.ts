export interface StoreMetrics {
  sales: number;
  visitors: number;
  conversion: number;
}

export interface Store {
  id: string;
  name: string;
  icon?: string;
  metrics: StoreMetrics;
  industry: NAICSCategory;
  subdomain: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  category?: string;
}

export interface Industry {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStoreInput {
  name: string;
  industry: string;
  subdomain: string;
  ownerId?: string;
}

export interface UpdateStoreInput {
  name?: string;
  industry?: NAICSCategory;
  subdomain?: string;
  metrics?: Partial<StoreMetrics>;
}

export interface CreateIndustryInput {
  name: string;
  description?: string;
}

export interface UpdateIndustryInput {
  name?: string;
  description?: string;
}

type User = {
  id: string;
  name: string;
  email: string;
  image: string;
  emailVerified: Date;
  roles: string[];
};

type Session = {
  id: string;
  userId: string;
  expires: Date;
  sessionToken: string;
  accessToken: string;
  user: User;
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
  ownerId: string;
};

type BusinessProfileImage = {
  id: string;
  businessProfileId: string;
  url: string;
  createdAt: Date;
  updatedAt: Date;
};

export type { User, Session, Account, VerificationToken, BusinessProfile, BusinessProfileImage };

export enum NAICSCategory {
  CROP_PRODUCTION = "CROP_PRODUCTION",
  ANIMAL_PRODUCTION = "ANIMAL_PRODUCTION",
  FORESTRY_LOGGING = "FORESTRY_LOGGING",
  // ... rest of the categories
}

export type ProductType = {
  id: string
  name: string
  description: string
  price: number
  sku: string
  category: string
  storeId: string
  createdAt: string
  updatedAt: string
  inventory?: number
  status?: 'draft' | 'active' | 'archived'
  images?: string[]
}

export interface CreateProductInput {
  name: string
  description: string
  price: number
  sku: string
  category: string
  storeId: string
  inventory?: number
  status?: 'draft' | 'active' | 'archived'
}
