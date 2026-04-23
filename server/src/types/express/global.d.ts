import type { DecodedIdToken } from "firebase-admin/auth";
import type { JwtPayloadDTO } from "../../dto/auth.dto";

declare global {
  namespace Express {
    interface FirebaseUser extends DecodedIdToken {
      name?: string;
      picture?: string;
    }

    interface Request {
      user?: FirebaseUser;
      auth?: JwtPayloadDTO;
    }
  }
}

export {};
