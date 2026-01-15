
/**
 * AD CONFIGURATION CENTER
 * ---------------------------------------------------------
 * Yahan aap apni Ads ki IDs aur Links paste kar sakte hain.
 * ---------------------------------------------------------
 */

export const AD_CONFIG = {
  // Aapka Publisher ID (e.g., ca-pub-1234567890123456)
  AD_CLIENT_ID: "ca-pub-placeholder", 

  // Har jagha ke liye alag slot ID yahan dalein
  SLOTS: {
    HEADER: "1234567890",        // Website ke bilkul oopar wala ad
    MIDDLE: "2345678901",        // Report card ke andar wala ad
    SIDE_LEFT: "3456789012",     // Desktop par left side wala ad
    SIDE_RIGHT: "4567890123",    // Desktop par right side wala ad
    BOTTOM: "5678901234",        // Footer ke oopar wala ad
    INTERSTITIAL: "6789012345",  // Download se pehle dikhne wala ad (Popup)
  },

  // Agar aap Google Ads ki jagha apna custom link/image chalana chahte hain
  CUSTOM_ADS: {
    ENABLED: false, // Isko true karein agar custom ad chalana hai
    IMAGE_URL: "https://via.placeholder.com/300x250",
    REDIRECT_URL: "https://your-link.com"
  }
};
