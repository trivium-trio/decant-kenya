import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { recordConsentAction } from "@/app/actions/analytics";

export type ConsentChoiceStatus = "pending" | "essential_only" | "analytics_granted";

interface ConsentState {
  status: ConsentChoiceStatus;
  isLoaded: boolean;
  setConsent: (choice: "essential_only" | "analytics_granted") => void;
  resetConsent: () => void;
  setLoaded: () => void;
}

export const useConsent = create<ConsentState>()(
  persist(
    (set) => ({
      status: "pending",
      isLoaded: false,
      setConsent: (choice) => {
        set({ status: choice, isLoaded: true });
        recordConsentAction({
          analytics: choice === "analytics_granted",
          updatedAt: new Date().toISOString(),
        }).catch(() => {
          // Ignore network errors in client for consent recording
        });
      },
      resetConsent: () => set({ status: "pending", isLoaded: true }),
      setLoaded: () => set({ isLoaded: true }),
    }),
    {
      name: "decant-consent",
      version: 1,
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? window.localStorage
          : ({
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            } as unknown as Storage),
      ),
      partialize: (state) => ({ status: state.status }),
      onRehydrateStorage: () => (state) => {
        state?.setLoaded();
      },
    },
  ),
);
