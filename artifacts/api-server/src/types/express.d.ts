import type { UserProfile } from "@workspace/db";
import type { EffectiveRole } from "../middlewares/auth";

declare global {
  namespace Express {
    interface Request {
      clerkUserId?: string;
      petPulseProfile?: UserProfile;
      petPulseRole?: EffectiveRole;
    }
  }
}

export {};
