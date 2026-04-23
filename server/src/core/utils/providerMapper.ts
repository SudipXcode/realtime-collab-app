import { AuthProvider } from "@prisma/client";

export function mapFirebaseProvider(provider: string): AuthProvider {
  switch (provider) {
    case "google.com":
      return AuthProvider.GOOGLE;
    case "github.com":
      return AuthProvider.GITHUB;
    case "facebook.com":
      return AuthProvider.FACEBOOK;
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}