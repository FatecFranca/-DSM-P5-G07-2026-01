export class User {
  id!: string;
  name!: string;
  email!: string;
  dateOfBirth!: Date;
  password!: string;
  onboardingDone: boolean = false;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;
  isActive: boolean = true;
  lastLoginAt?: Date;
  failedLoginAttempts: number = 0;
  lastFailedLoginAt?: Date;
}
