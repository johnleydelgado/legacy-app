"use client";

// List of common customer acknowledgement statements used across quote/order approval documents.
// Dynamic notices (e.g., state-specific tax statements) should be appended by the consuming component.
// Update this list in a single place instead of scattering copy throughout the codebase.

export const BASE_ACKNOWLEDGEMENTS: string[] = [
  "This art proof is not a valid order/confirmation until all spaces have been completed and a 50 % initial deposit is processed.",
  "I have reviewed and initialled all required fields (Spelling, Logo, Placement).",
  "I understand that the colours on my computer screen may vary from the actual yarn colours.",
  "I understand that socks are a knitted product and that knitting different colours can sometimes produce slight changes in tone.",
  "I understand that because my socks are knitted, certain designs and shapes will not always be reproduced 100 % compared to the mock-up.",
  "I understand that unless otherwise mentioned, each pair will be swift-tagged and individually poly-bagged.",
  "I understand that sock sizes differ from shoe sizes and cover multiple foot sizes; I am responsible for ordering the correct sock sizes to meet my project needs.",
  "I understand that the use of black or white backing yarn can slightly alter the overlying yarn colours.",
  "I understand that Legacy Knitting will not accept this order until this form is signed and a 50 % deposit has been received.",
  "I understand that design or colour errors may occur; it is my responsibility to confirm all colour, logo and size specifications prior to production.",
  "I understand that custom sock manufacturing requires an overage/underage of 5–6 % to ensure the project ships complete and I will accept any additional pairs added to my invoice, if applicable.",
  "I acknowledge that I have the rights to use any logos on the socks and assume full responsibility for their reproduction.",
  "All artwork created by Legacy Knitting artists and not used by the client remains the property of Legacy Knitting LLC unless otherwise purchased.",
  "The credit card used for the deposit will be pre-authorised and charged for the final balance due.",
  "Legacy Knitting guarantees product quality 100 %, but is not responsible for customer-approved design or colour decisions resulting in incorrect socks.",
  "As mentioned above, we have a 5–6 % over/under policy; final quantity adjustments will be reflected on your final invoice.",
];
