const WHATSAPP_API_TOKEN = process.env.WHATSAPP_CLOUD_API_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_CLOUD_PHONE_NUMBER_ID;
const WHATSAPP_RECIPIENT_NUMBER = process.env.WHATSAPP_BOOKING_RECIPIENT_NUMBER;

type BookingWhatsappPayload = {
  bookingCode: string;
  fullName: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  cottageName: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  adults: number;
  children: number;
  infants: number;
  estimatedTotal: number;
  specialRequests: string;
  bookingSource: string;
};

type NotificationResult = {
  ok: boolean;
  skipped?: boolean;
  error?: string;
};

function formatBookingWhatsappMessage(payload: BookingWhatsappPayload) {
  return [
    "New Booking Request - La Ki Trep",
    "",
    `Ref: ${payload.bookingCode}`,
    `Guest: ${payload.fullName}`,
    `Phone: ${payload.phone}`,
    `WhatsApp: ${payload.whatsappNumber}`,
    `Email: ${payload.email}`,
    "",
    `Cottage: ${payload.cottageName}`,
    `Check-in: ${payload.checkInDate}`,
    `Check-out: ${payload.checkOutDate}`,
    `Nights: ${payload.nights}`,
    "",
    "Guests:",
    `Adults: ${payload.adults}`,
    `Children: ${payload.children}`,
    `Infants: ${payload.infants}`,
    "",
    `Estimated Total: ₹${Math.max(0, payload.estimatedTotal).toLocaleString("en-IN")}`,
    "",
    "Special Requests:",
    payload.specialRequests,
    "",
    `Source: ${payload.bookingSource}`,
    "Please follow up with the guest.",
  ].join("\n");
}

export async function sendBookingWhatsappNotification(payload: BookingWhatsappPayload): Promise<NotificationResult> {
  // Required env vars for WhatsApp Cloud API:
  // WHATSAPP_CLOUD_API_TOKEN, WHATSAPP_CLOUD_PHONE_NUMBER_ID, WHATSAPP_BOOKING_RECIPIENT_NUMBER
  if (!WHATSAPP_API_TOKEN || !WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_RECIPIENT_NUMBER) {
    return { ok: false, skipped: true, error: "WhatsApp Cloud API env vars are not configured." };
  }

  const message = formatBookingWhatsappMessage(payload);

  const response = await fetch(`https://graph.facebook.com/v23.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WHATSAPP_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: WHATSAPP_RECIPIENT_NUMBER,
      type: "text",
      text: {
        preview_url: false,
        body: message,
      },
    }),
  });

  if (!response.ok) {
    const failureBody = await response.text();
    return {
      ok: false,
      error: `WhatsApp API request failed (${response.status}): ${failureBody}`,
    };
  }

  return { ok: true };
}
