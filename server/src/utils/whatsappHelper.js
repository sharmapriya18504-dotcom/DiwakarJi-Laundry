function formatPickupDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch (e) {
    return dateStr;
  }
}

function buildOwnerWhatsAppMessage(data, bookingRef, ownerName = 'Diwakar Ji') {
  const line = '\n';
  const formattedDate = formatPickupDate(data.pickup_date);
  
  let msg = '';
  msg += `🧺 *New Laundry Booking — ${ownerName}*${line}${line}`;
  msg += `Hello ${ownerName},${line}${line}`;
  msg += `I would like to book a laundry pickup.${line}${line}`;
  msg += `━━━━━━━━━━━━━━━━━━${line}`;
  if (bookingRef) {
    msg += `🔖 *Booking Ref:* ${bookingRef}${line}`;
  }
  msg += `👤 *Name:* ${data.customer_name}${line}`;
  msg += `📱 *Mobile:* ${data.mobile_number}${line}`;
  msg += `🏠 *Address:* ${data.pickup_address}${line}`;
  msg += `📍 *Area / PIN Code:* ${data.area}${line}`;
  msg += `👕 *Service:* ${data.service_name}${line}`;
  msg += `⚖️ *Estimated Quantity:* ${data.quantity}${line}`;
  if (data.estimated_price) {
    msg += `💰 *Estimated Price:* ${data.estimated_price}${line}`;
  }
  msg += `📅 *Pickup Date:* ${formattedDate}${line}`;
  msg += `⏰ *Preferred Time:* ${data.pickup_time}${line}`;
  if (data.special_instructions && data.special_instructions.trim()) {
    msg += `📝 *Special Instructions:* ${data.special_instructions.trim()}${line}`;
  } else {
    msg += `📝 *Special Instructions:* —${line}`;
  }
  msg += `━━━━━━━━━━━━━━━━━━${line}${line}`;
  msg += `Please confirm availability and the final price.${line}${line}`;
  msg += 'Thank you! 🙏';

  return msg;
}

function getOwnerWhatsAppUrl(message, ownerPhone = '917860462268') {
  const cleanPhone = ownerPhone.replace(/[^0-9]/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

module.exports = {
  formatPickupDate,
  buildOwnerWhatsAppMessage,
  getOwnerWhatsAppUrl
};
