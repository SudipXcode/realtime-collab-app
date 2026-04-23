import jwt, { SignOptions } from "jsonwebtoken";
import { ENV } from "../../config/env";
import { JwtPayloadSchema, JwtPayloadDTO } from "../../dto/auth.dto";

const accessTokenOptions: SignOptions = {
  expiresIn: ENV.ACCESS_TOKEN_EXPIRES_IN as SignOptions["expiresIn"],
};

const refreshTokenOptions: SignOptions = {
  expiresIn: ENV.REFRESH_TOKEN_EXPIRES_IN as SignOptions["expiresIn"],
};

export const generateAccessToken = ( id: number | string, email: string) => {
  const payload: JwtPayloadDTO = {
    id: String(id),
    email,
  };

  JwtPayloadSchema.parse(payload);

  return jwt.sign(
    payload,
    ENV.ACCESS_TOKEN_SECRET,
    accessTokenOptions,
  );
};

export const generateRefreshToken = ( id: number | string, email: string) => {
  const payload: JwtPayloadDTO = {
    id: String(id),
    email,
  };

  JwtPayloadSchema.parse(payload);

  return jwt.sign(
    payload,
    ENV.REFRESH_TOKEN_SECRET,
    refreshTokenOptions,
  );
};

export const verifyAccessToken = (token: string): JwtPayloadDTO => {
  const decoded = jwt.verify(token, ENV.ACCESS_TOKEN_SECRET);
  return JwtPayloadSchema.parse(decoded);
};

export const verifyRefreshToken = (token: string): JwtPayloadDTO => {
  const decoded = jwt.verify(token, ENV.REFRESH_TOKEN_SECRET);
  return JwtPayloadSchema.parse(decoded);
};
