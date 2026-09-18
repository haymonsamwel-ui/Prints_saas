"use client";

import { useEffect, useState } from "react";
import { companyProfile } from "@/lib/constants";

export const studioProfileStorageKey = "creative-business-os:studio-profile";
export const studioProfileChangedEvent = "studio-profile-changed";

export type StudioProfile = {
  name: string;
  slug: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
  tin: string;
  vatNumber: string;
  logoDataUrl?: string;
};

export const defaultStudioProfile: StudioProfile = { ...companyProfile };

function toSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function readStudioProfile() {
  if (typeof window === "undefined") {
    return defaultStudioProfile;
  }

  const savedProfile = window.localStorage.getItem(studioProfileStorageKey);

  if (!savedProfile) {
    return defaultStudioProfile;
  }

  try {
    return { ...defaultStudioProfile, ...JSON.parse(savedProfile) } as StudioProfile;
  } catch {
    return defaultStudioProfile;
  }
}

export function saveStudioProfile(profile: Partial<StudioProfile> & { name: string }) {
  const nextProfile: StudioProfile = {
    ...readStudioProfile(),
    ...profile,
    slug: profile.slug || toSlug(profile.name) || defaultStudioProfile.slug,
  };

  window.localStorage.setItem(studioProfileStorageKey, JSON.stringify(nextProfile));
  window.dispatchEvent(new Event(studioProfileChangedEvent));

  return nextProfile;
}

export function useStudioProfile() {
  const [profile, setProfile] = useState(defaultStudioProfile);

  useEffect(() => {
    function syncProfile() {
      setProfile(readStudioProfile());
    }

    syncProfile();
    window.addEventListener("storage", syncProfile);
    window.addEventListener(studioProfileChangedEvent, syncProfile);

    return () => {
      window.removeEventListener("storage", syncProfile);
      window.removeEventListener(studioProfileChangedEvent, syncProfile);
    };
  }, []);

  return profile;
}
