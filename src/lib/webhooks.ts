export const MAKE_WEBHOOKS = {
  CONTACT: 'https://hook.eu1.make.com/56c3jir5d9u8zldn0zk8m3scidquzpbr',
  BOOKING: 'https://hook.eu1.make.com/ss0zep96o4ii976526rjlor8gc8y8h7p',
};

export async function sendContactWebhook(data: {
  name: string;
  email: string;
  phone?: string;
  travel_dates?: string;
  group_size?: number;
  budget_range?: string;
  service_interests?: string[];
  special_requirements?: string;
  [key: string]: any;
}) {
  try {
    const payload = {
      event_type: 'contact_submission',
      submitted_at: new Date().toISOString(),
      name: data.name,
      email: data.email,
      phone: data.phone || 'Not provided',
      travel_dates: data.travel_dates || 'Not specified',
      group_size: data.group_size || 1,
      budget_range: data.budget_range || 'Not specified',
      service_interests: Array.isArray(data.service_interests) ? data.service_interests.join(', ') : (data.service_interests || 'None'),
      special_requirements: data.special_requirements || 'None',
      ...data,
    };

    await fetch(MAKE_WEBHOOKS.CONTACT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn('Failed to send contact webhook to Make.com:', err);
  }
}

export async function sendBookingWebhook(data: {
  type?: 'trek' | 'package' | 'destination' | 'general';
  name: string;
  email: string;
  phone?: string;
  item_name?: string;
  trek_name?: string;
  destination_name?: string;
  num_people?: number;
  group_size?: number;
  travel_date?: string;
  budget_range?: string;
  message?: string;
  special_requests?: string;
  total_amount?: number;
  [key: string]: any;
}) {
  try {
    const payload = {
      event_type: 'booking_submission',
      submitted_at: new Date().toISOString(),
      booking_type: data.type || 'trek',
      item_name: data.item_name || data.trek_name || data.destination_name || 'Trek / Package Booking',
      name: data.name,
      email: data.email,
      phone: data.phone || 'Not provided',
      num_people: data.num_people || data.group_size || 1,
      travel_date: data.travel_date || 'Flexible / As scheduled',
      budget_range: data.budget_range || 'Standard',
      message: data.message || data.special_requests || 'None',
      total_amount: data.total_amount ? `₹${data.total_amount}` : 'To be confirmed',
      ...data,
    };

    await fetch(MAKE_WEBHOOKS.BOOKING, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.warn('Failed to send booking webhook to Make.com:', err);
  }
}
