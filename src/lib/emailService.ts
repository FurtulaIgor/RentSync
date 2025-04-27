import emailjs from 'emailjs-com';

interface BookingEmailParams {
  guestName: string;
  guestEmail: string;
  checkInDate: string;
  checkOutDate: string;
  price: number;
  hostEmail: string;
}

export const sendBookingConfirmation = async (params: BookingEmailParams) => {
  const { guestName, guestEmail, checkInDate, checkOutDate, price, hostEmail } = params;
  
  try {
    // Format dates for display
    const formattedCheckIn = new Date(checkInDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const formattedCheckOut = new Date(checkOutDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // This is a mock function that would normally send an email
    // In a real implementation, you would use EmailJS service ID, template ID, and user ID
    console.log(`Email notification would be sent with EmailJS:
      To: ${hostEmail}
      Subject: New Booking Confirmation
      Body: 
        Guest: ${guestName} (${guestEmail})
        Check-in: ${formattedCheckIn}
        Check-out: ${formattedCheckOut}
        Total: $${price}
    `);
    
    // In a real implementation with proper EmailJS setup:
    /*
    return await emailjs.send(
      'YOUR_EMAILJS_SERVICE_ID',
      'YOUR_EMAILJS_TEMPLATE_ID',
      {
        to_email: hostEmail,
        guest_name: guestName,
        guest_email: guestEmail,
        check_in_date: formattedCheckIn,
        check_out_date: formattedCheckOut,
        price: price.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
      },
      'YOUR_EMAILJS_USER_ID'
    );
    */
    
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email notification');
  }
};