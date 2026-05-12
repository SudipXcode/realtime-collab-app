
// "use client";

// import React, { useState, useRef } from "react";
// import Image from "next/image";
// import type { StaticImageData } from "next/image";
// import { useRouter } from "next/navigation";
// import OAuthButton from "../ui/OAuthButton";
// import GoogleLogo from "../../public/google-brands-solid-full.svg";
// import GithubLogo from "../../public/github-brands-solid-full.svg";
// import FacebookLogo from "../../public/facebook-f-brands-solid-full.svg";

// import GoogleLogoHover from "../../public/google-brands-solid-full (1).svg";
// import GithubLogoHover from "../../public/github-brands-solid-full (1).svg";
// import FacebookLogoHover from "../../public/facebook-f-brands-solid-full (1).svg";

// import {
//   signInWithPopup,
//   GoogleAuthProvider,
//   FacebookAuthProvider,
//   GithubAuthProvider,
//   fetchSignInMethodsForEmail,
//   AuthProvider,
//   User,
//   linkWithCredential,
// } from "firebase/auth";

// import { FirebaseError } from "firebase/app";
// import { auth } from "@/lib/firebase";
// import { getCsrf } from "@/lib/csrf";

// /* ---------------- Backend Error ---------------- */

// class BackendAuthError extends Error {
//   status: number;

//   constructor(message: string, status: number) {
//     super(message);
//     this.name = "BackendAuthError";
//     this.status = status;
//   }
// }

// /* ---------------- Providers ---------------- */

// const providers = {
//   google: new GoogleAuthProvider(),
//   github: new GithubAuthProvider(),
//   facebook: new FacebookAuthProvider(),
// };

// const PROVIDER_FACTORIES: Record<string, () => AuthProvider> = {
//   "google.com": () => new GoogleAuthProvider(),
//   "github.com": () => new GithubAuthProvider(),
//   "facebook.com": () => new FacebookAuthProvider(),
// };

// const PROVIDER_META: Record<string, { label: string; icon: StaticImageData }> = {
//   "google.com": { label: "Google", icon: GoogleLogo },
//   "github.com": { label: "GitHub", icon: GithubLogo },
//   "facebook.com": { label: "Facebook", icon: FacebookLogo },
// };

// function getPendingCredential(error: FirebaseError) {
//   return (
//     GoogleAuthProvider.credentialFromError(error) ||
//     GithubAuthProvider.credentialFromError(error) ||
//     FacebookAuthProvider.credentialFromError(error)
//   );
// }

// /* ---------------- Component ---------------- */

// const FirebaseOAuth = () => {
//   const router = useRouter();

//   const [loading, setLoading] = useState(false);
//   const [activeProvider, setActiveProvider] = useState<string | null>(null);
//   const [message, setMessage] = useState<string | null>(null);
//   const [existingProvider, setExistingProvider] = useState<{
//     label: string;
//     icon: StaticImageData
//   } | null>(null);

//   const loadingRef = useRef(false);

//   /* ---------------- Backend login ---------------- */

//   const afterLogin = async (user: User) => {
//     const token = await user.getIdToken();
//     const { csrfToken } = await getCsrf();

//     const res = await fetch(
//       `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
//       {
//         method: "POST",
//         credentials: "include",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "x-csrf-token": csrfToken,
//         },
//       }
//     );

//     if (!res.ok) {
//       let message = "Backend authentication failed";

//       try {
//         const payload = await res.json();
//         message = payload?.message || message;
//       } catch { }

//       throw new BackendAuthError(message, res.status);
//     }

//     router.replace("/library");
//     router.refresh();
//   };

//   /* ---------------- Account Linking ---------------- */

//   const handleAccountLinking = async (error: FirebaseError) => {
//     const email = error.customData?.email as string | undefined;

//     if (!email) {
//       setMessage("Unable to complete sign in.");
//       return;
//     }
//     const pendingCredential = getPendingCredential(error);

//     if (!pendingCredential) {
//       setMessage("Unsupported sign-in provider.");
//       return;
//     }

//     const methods = await fetchSignInMethodsForEmail(auth, email);

//     if (methods.includes("password")) {
//       setMessage("This email is registered with Email & Password.");
//       return;
//     }

//     const providerId = methods.find((m) => PROVIDER_META[m]);

//     if (!providerId) {
//       setMessage("Account exists with another provider.");
//       return;
//     }

//     setExistingProvider(PROVIDER_META[providerId]);

//     try {
//       const primaryProvider = PROVIDER_FACTORIES[providerId]();
//       const result = await signInWithPopup(auth, primaryProvider);

//       await linkWithCredential(result.user, pendingCredential);
//       await afterLogin(result.user);
//     } catch (err) {
//       console.error(err);
//       setMessage("Failed to link accounts.");
//     }
//   };

//   /* ---------------- Sign In ---------------- */

//   const signIn = async (provider: AuthProvider, providerId: string) => {
//     if (loadingRef.current) return;

//     loadingRef.current = true;
//     setLoading(true);
//     setActiveProvider(providerId);
//     setMessage(null);
//     setExistingProvider(null);

//     try {
//       const result = await signInWithPopup(auth, provider);
//       await afterLogin(result.user);
//     } catch (error: unknown) {
//       if (error instanceof FirebaseError) {
//         if (
//           error.code === "auth/popup-closed-by-user" ||
//           error.code === "auth/cancelled-popup-request"
//         ) {
//           return;
//         }

//         if (error.code === "auth/account-exists-with-different-credential") {
//           await handleAccountLinking(error);
//           return;
//         }

//         if (error.code === "auth/network-request-failed") {
//           setMessage("Network error. Check your connection.");
//           return;
//         }

//         console.error(error);
//         setMessage("Authentication failed.");
//         return;
//       }

//       if (error instanceof BackendAuthError) {
//         if (error.status === 401 || error.status === 403) {
//           setMessage("Session expired. Try again.");
//           return;
//         }

//         setMessage(error.message);
//         return;
//       }

//       console.error(error);
//       setMessage("Something went wrong.");
//     } finally {
//       loadingRef.current = false;
//       setLoading(false);
//       setActiveProvider(null);
//     }
//   };

//   return (
//     <div className="w-70 flex flex-col gap-3">
//       {message && (
//         <div className="my-2 flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-[13px] text-yellow-400">
//           {existingProvider?.icon && (
//             <Image
//               src={existingProvider.icon}
//               alt={existingProvider.label}
//               width={16}
//               height={16}
//             />
//           )}
//           <span>{message}</span>
//         </div>
//       )}

//       <OAuthButton
//         logo={GoogleLogo}
//         logo2={GoogleLogoHover}
//         label="Google"
//         disabled={loading}
//         loading={activeProvider === "google"}
//         onClick={() => signIn(providers.google, "google")}
//       />

//       <OAuthButton
//         logo={GithubLogo}
//         logo2={GithubLogoHover}
//         label="GitHub"
//         disabled={loading}
//         loading={activeProvider === "github"}
//         onClick={() => signIn(providers.github, "github")}
//       />

//       <OAuthButton
//         logo={FacebookLogo}
//         logo2={FacebookLogoHover}
//         label="Facebook"
//         disabled={loading}
//         loading={activeProvider === "facebook"}
//         onClick={() => signIn(providers.facebook, "facebook")}
//       />
//     </div>
//   );
// };

// export default FirebaseOAuth;

"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import type { StaticImageData } from "next/image";
import { useRouter } from "next/navigation";
import OAuthButton from "../ui/OAuthButton";
import GoogleLogo from "../../public/google-brands-solid-full.svg";
import GithubLogo from "../../public/github-brands-solid-full.svg";
import FacebookLogo from "../../public/facebook-f-brands-solid-full.svg";

import GoogleLogoHover from "../../public/google-brands-solid-full (1).svg";
import GithubLogoHover from "../../public/github-brands-solid-full (1).svg";
import FacebookLogoHover from "../../public/facebook-f-brands-solid-full (1).svg";

import {
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
  fetchSignInMethodsForEmail,
  AuthProvider,
  User,
  linkWithCredential,
} from "firebase/auth";

import { FirebaseError } from "firebase/app";
import { auth } from "@/lib/firebase";
import { getCsrf } from "@/lib/csrf";

/* ---------------- Backend Error ---------------- */

class BackendAuthError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "BackendAuthError";
    this.status = status;
  }
}

/* ---------------- Providers ---------------- */

const providers = {
  google: new GoogleAuthProvider(),
  github: new GithubAuthProvider(),
  facebook: new FacebookAuthProvider(),
};

const PROVIDER_FACTORIES: Record<string, () => AuthProvider> = {
  "google.com": () => new GoogleAuthProvider(),
  "github.com": () => new GithubAuthProvider(),
  "facebook.com": () => new FacebookAuthProvider(),
};

const PROVIDER_META: Record<string, { label: string; icon: StaticImageData }> = {
  "google.com": { label: "Google", icon: GoogleLogo },
  "github.com": { label: "GitHub", icon: GithubLogo },
  "facebook.com": { label: "Facebook", icon: FacebookLogo },
};

function getPendingCredential(error: FirebaseError) {
  return (
    GoogleAuthProvider.credentialFromError(error) ||
    GithubAuthProvider.credentialFromError(error) ||
    FacebookAuthProvider.credentialFromError(error)
  );
}

/* ---------------- Component ---------------- */

const FirebaseOAuth = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [existingProvider, setExistingProvider] = useState<{
    label: string;
    icon: StaticImageData;
  } | null>(null);

  const loadingRef = useRef(false);

  /* ---------------- Backend login ---------------- */

  const afterLogin = async (user: User) => {
    const token = await user.getIdToken();
    const { csrfToken } = await getCsrf();

    // ✅ FIXED: Use relative URL /api/auth/login — NOT process.env.NEXT_PUBLIC_API_URL
    // This hits the Next.js rewrite → backend, so cookies are set same-origin
    // and the browser stores them correctly.
    const res = await fetch("/api/auth/login", {
      method: "POST",
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
        "x-csrf-token": csrfToken,
      },
    });

    if (!res.ok) {
      let message = "Backend authentication failed";

      try {
        const payload = await res.json();
        message = payload?.message || message;
      } catch {}

      throw new BackendAuthError(message, res.status);
    }

    // ✅ router.replace navigates without adding to history
    // router.refresh() forces Next.js to re-run server components + middleware
    router.replace("/library");
    router.refresh();
  };

  /* ---------------- Account Linking ---------------- */

  const handleAccountLinking = async (error: FirebaseError) => {
    const email = error.customData?.email as string | undefined;

    if (!email) {
      setMessage("Unable to complete sign in.");
      return;
    }

    const pendingCredential = getPendingCredential(error);

    if (!pendingCredential) {
      setMessage("Unsupported sign-in provider.");
      return;
    }

    const methods = await fetchSignInMethodsForEmail(auth, email);

    if (methods.includes("password")) {
      setMessage("This email is registered with Email & Password.");
      return;
    }

    const providerId = methods.find((m) => PROVIDER_META[m]);

    if (!providerId) {
      setMessage("Account exists with another provider.");
      return;
    }

    setExistingProvider(PROVIDER_META[providerId]);

    try {
      const primaryProvider = PROVIDER_FACTORIES[providerId]();
      const result = await signInWithPopup(auth, primaryProvider);

      await linkWithCredential(result.user, pendingCredential);
      await afterLogin(result.user);
    } catch (err) {
      console.error(err);
      setMessage("Failed to link accounts.");
    }
  };

  /* ---------------- Sign In ---------------- */

  const signIn = async (provider: AuthProvider, providerId: string) => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    setActiveProvider(providerId);
    setMessage(null);
    setExistingProvider(null);

    try {
      const result = await signInWithPopup(auth, provider);
      await afterLogin(result.user);
    } catch (error: unknown) {
      if (error instanceof FirebaseError) {
        if (
          error.code === "auth/popup-closed-by-user" ||
          error.code === "auth/cancelled-popup-request"
        ) {
          return;
        }

        if (error.code === "auth/account-exists-with-different-credential") {
          await handleAccountLinking(error);
          return;
        }

        if (error.code === "auth/network-request-failed") {
          setMessage("Network error. Check your connection.");
          return;
        }

        console.error(error);
        setMessage("Authentication failed.");
        return;
      }

      if (error instanceof BackendAuthError) {
        if (error.status === 401 || error.status === 403) {
          setMessage("Session expired. Try again.");
          return;
        }

        setMessage(error.message);
        return;
      }

      console.error(error);
      setMessage("Something went wrong.");
    } finally {
      loadingRef.current = false;
      setLoading(false);
      setActiveProvider(null);
    }
  };

  return (
    <div className="w-70 flex flex-col gap-3">
      {message && (
        <div className="my-2 flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-[13px] text-yellow-400">
          {existingProvider?.icon && (
            <Image
              src={existingProvider.icon}
              alt={existingProvider.label}
              width={16}
              height={16}
            />
          )}
          <span>{message}</span>
        </div>
      )}

      <OAuthButton
        logo={GoogleLogo}
        logo2={GoogleLogoHover}
        label="Google"
        disabled={loading}
        loading={activeProvider === "google"}
        onClick={() => signIn(providers.google, "google")}
      />

      <OAuthButton
        logo={GithubLogo}
        logo2={GithubLogoHover}
        label="GitHub"
        disabled={loading}
        loading={activeProvider === "github"}
        onClick={() => signIn(providers.github, "github")}
      />

      <OAuthButton
        logo={FacebookLogo}
        logo2={FacebookLogoHover}
        label="Facebook"
        disabled={loading}
        loading={activeProvider === "facebook"}
        onClick={() => signIn(providers.facebook, "facebook")}
      />
    </div>
  );
};

export default FirebaseOAuth;