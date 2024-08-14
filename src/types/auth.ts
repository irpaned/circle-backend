export type UserJWTPayload = {
    id: number;
    userName: string;
    fullName: string;
    email: string;
    photoProfile: string;
    bio: string;
    createdAt: Date;
    updatedAt: Date;
  };