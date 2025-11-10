
import { Room } from "@/types/booking";
import { formatCurrency } from "@/utils/currencyUtils";
import { format, isValid, parseISO } from "date-fns";

// Types
interface ReceiptData {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  roomName: string;
  roomType: string;
  pricePerNight?: number;
  nights?: number;
  checkInDate: Date | string;
  checkOutDate: Date | string;
  guests: number;
  price: number;
  sgst?: number;
  cgst?: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentId: string;
  transactionDate: Date | string;
  receiptNumber: string;
  qrCodeData?: string;
  withBreakfast?: boolean;
  breakfastPrice?: number;
  paidStamp?: boolean; // Added paid stamp flag
  roomCount?: number; // Added room count
  adults?: number;     // Added adults count
  children?: number;   // Added children count
  promoCode?: string;  // Added promo code
  discountAmount?: number; // Added discount amount from promo code
  originalPrice?: number; // Added original price before discount
  customTerms?: boolean; // Added customTerms property
}

// Business information
const businessInfo = {
  name: "The Royal Pavilion",
  tagline: "Luxury Hotel & Resort",
  company: "Laxman Takkekar Hospitality",
  address: "Plot No. 28, Hockey Stadium Rd, opp. IT Park, B Ward, Datta Colony, Kolhapur, Maharashtra 416012",
  phone: "+91 8600467805, +91 8600357805", // Updated phone numbers
  email: "support@theroyalpavilion.in",
  logo: "/lovable-uploads/a81cddd6-7a31-4997-9b7d-3f8a5e7898f7.png",
  website: "theroyalpavilion.in"
};

/**
 * Generates a unique receipt number based on date and booking ID
 */
export const generateReceiptNumber = (bookingId: string): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');
  const shortId = bookingId.substring(0, 6);
  
  return `RP-${year}${month}${day}-${shortId.toUpperCase()}`;
};

/**
 * Safely formats a date value, handling both string and Date objects
 * Returns a fallback string if the date is invalid
 */
const safeFormatDate = (date: Date | string | null | undefined, formatStr: string, fallback: string = 'N/A'): string => {
  if (!date) return fallback;
  
  try {
    // Handle string dates
    if (typeof date === 'string') {
      // Try to parse ISO format first
      const parsedDate = parseISO(date);
      if (isValid(parsedDate)) {
        return format(parsedDate, formatStr);
      }
      
      // If ISO parsing fails, it might be already formatted
      return date;
    }
    
    // Handle Date objects
    if (date instanceof Date && isValid(date)) {
      return format(date, formatStr);
    }
    
    return fallback;
  } catch (error) {
    console.error('Error formatting date:', error, date);
    return fallback;
  }
};

/**
 * Generates receipt HTML for rendering or PDF generation
 */
export const generateReceiptHtml = (data: ReceiptData): string => {
  const checkInFormatted = safeFormatDate(data.checkInDate, 'dd MMM yyyy', 'Date not specified');
  const checkOutFormatted = safeFormatDate(data.checkOutDate, 'dd MMM yyyy', 'Date not specified');
  const transactionDateFormatted = safeFormatDate(data.transactionDate, 'dd MMM yyyy, HH:mm:ss', 'Transaction date not recorded');
  
  // Room count information
  const roomCount = data.roomCount || 1;
  const roomCountDisplay = roomCount > 1 ? `${roomCount} rooms` : '1 room';
  
  // Guest information
  const adults = data.adults || 0;
  const children = data.children || 0;
  const totalGuests = adults + children;
  const guestDisplay = `${adults} Adult${adults !== 1 ? 's' : ''}${children > 0 ? `, ${children} Child${children !== 1 ? 'ren' : ''}` : ''}`;
  
  // Calculate any breakfast charges if applicable
  const breakfastInfo = data.withBreakfast && data.breakfastPrice ? 
    `<tr>
      <td style="padding: 12px 15px; border-bottom: 1px solid #ddd;">Breakfast</td>
      <td style="text-align: right; padding: 12px 15px; border-bottom: 1px solid #ddd;">
        ${formatCurrency(data.breakfastPrice)} × ${totalGuests} person${totalGuests !== 1 ? 's' : ''} × ${data.nights || 1} night${(data.nights || 1) !== 1 ? 's' : ''}
      </td>
    </tr>
    <tr>
      <td style="padding: 12px 15px; border-bottom: 1px solid #ddd;">Breakfast Total</td>
      <td style="text-align: right; padding: 12px 15px; border-bottom: 1px solid #ddd;">
        ${formatCurrency((data.breakfastPrice || 0) * totalGuests * (data.nights || 1))}
      </td>
    </tr>` : '';
  
  // Updated PAID stamp using the new uploaded "PAID IN FULL" image
  const paidStampHtml = data.paidStamp ? `
    <div style="position: absolute; top: 120px; right: 40px; transform: rotate(15deg); opacity: 0.9; z-index: 10;">
      <img src="/lovable-uploads/d9e37415-3aaa-4843-a773-425803c96a69.png" width="180" height="180" alt="PAID IN FULL" />
    </div>
  ` : '';
  
  // Generate the tax breakdown with exact 6.1% rate
  const taxBreakdown = `
    <tr>
      <td style="padding: 12px 15px; border-bottom: 1px solid #ddd;">CGST (6.1%)</td>
      <td style="text-align: right; padding: 12px 15px; border-bottom: 1px solid #ddd;">${formatCurrency(data.cgst || 0)}</td>
    </tr>
    <tr>
      <td style="padding: 12px 15px; border-bottom: 1px solid #ddd;">SGST (6.1%)</td>
      <td style="text-align: right; padding: 12px 15px; border-bottom: 1px solid #ddd;">${formatCurrency(data.sgst || 0)}</td>
    </tr>
  `;
  
  // Promo code discount information
  const promoCodeInfo = data.promoCode && data.discountAmount ? `
    <tr>
      <td style="padding: 12px 15px; border-bottom: 1px solid #ddd;">Original Price</td>
      <td style="text-align: right; padding: 12px 15px; border-bottom: 1px solid #ddd;">${formatCurrency(data.originalPrice || data.price + (data.discountAmount || 0))}</td>
    </tr>
    <tr>
      <td style="padding: 12px 15px; border-bottom: 1px solid #ddd; color: #22c55e;">Promo Discount (${data.promoCode})</td>
      <td style="text-align: right; padding: 12px 15px; border-bottom: 1px solid #ddd; color: #22c55e;">- ${formatCurrency(data.discountAmount)}</td>
    </tr>
  ` : '';

  // Updated terms and conditions with more professional formatting
  const termsAndConditionsHtml = `
    <div style="margin-top: 30px; padding: 15px; border-radius: 8px; background: rgba(212,175,55,0.05); border: 1px solid rgba(212,175,55,0.2);">
      <p style="font-size: 14px; color: #333; margin-bottom: 8px; font-weight: bold; border-bottom: 1px solid rgba(212,175,55,0.3); padding-bottom: 5px;">
        Terms & Conditions:
      </p>
      <ol style="font-size: 12px; color: #444; padding-left: 20px; margin: 10px 0; line-height: 1.6;">
        <li>Check in Time: <strong>12 PM</strong>, Check Out Time: <strong>10 AM</strong></li>
        <li>Early Check In and late Check Out can be extended Subject to Room availability.</li>
        <li>All Guest(s) Address ID proof is mandatory, except child below 7 Years Old.</li>
        <li>For Extra Persons in the room, we will provide only floor mattress.</li>
        <li>The Management does not take the responsibility for loss of valuables/Cash left by Guest(s) in the rooms.</li>
        <li>Visitors are Not Permitted in the Guest Room.</li>
        <li>Pets are not allowed in the Hotel Premises.</li>
        <li>Outside Food and Beverages not allowed.</li>
        <li>Room Preferences will be Subject to availability.</li>
      </ol>
    </div>
  `;
  
  // Updated header with centered business information and company name moved to be above the hotel name
  return `
    <div class="receipt" style="font-family: 'Playfair Display', 'Cormorant Garamond', serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #333; position: relative;">
      ${paidStampHtml}
      <div style="background: linear-gradient(to right, #D4AF37, #f9f0cc, #D4AF37); height: 10px; margin-bottom: 30px;"></div>
      
      <div style="display: flex; justify-content: center; align-items: center; margin-bottom: 30px; flex-direction: column; text-align: center;">
        <div>
          <img src="${businessInfo.logo}" alt="Royal Pavilion Logo" style="width: 140px; height: auto; margin-bottom: 15px;">
        </div>
        <div>
          <p style="margin: 0 0 5px; font-family: 'Playfair Display', 'Cormorant Garamond', serif; color: #D4AF37; font-size: 18px; font-weight: 600;">${businessInfo.company}</p>
          <h1 style="color: #D4AF37; margin: 0; font-family: 'Playfair Display', 'Cormorant Garamond', serif; font-size: 28px; font-weight: 700;">${businessInfo.name}</h1>
          <p style="margin: 5px 0 0; font-style: italic;">${businessInfo.tagline}</p>
          <p style="margin: 5px 0 0;">${businessInfo.address}</p>
          <p style="margin: 5px 0 0;">${businessInfo.phone} | ${businessInfo.email}</p>
          <p style="margin: 5px 0 0;">${businessInfo.website}</p>
        </div>
      </div>
      
      <div style="background-color: #f9f9f9; border-top: 2px solid #D4AF37; border-bottom: 2px solid #D4AF37; padding: 15px; margin: 20px 0; text-align: center; position: relative; overflow: hidden;">
        <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(45deg, rgba(212,175,55,0.1) 25%, transparent 25%, transparent 50%, rgba(212,175,55,0.1) 50%, rgba(212,175,55,0.1) 75%, transparent 75%); background-size: 10px 10px; opacity: 0.3;"></div>
        <h2 style="margin: 0; color: #333; text-align: center; position: relative; font-size: 24px; letter-spacing: 1px;">BOOKING RECEIPT</h2>
      </div>
      
      <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
        <div style="width: 48%;">
          <h3 style="margin: 0 0 15px; border-bottom: 1px solid #D4AF37; padding-bottom: 8px; color: #D4AF37; font-size: 18px;">Guest Information</h3>
          <p style="margin: 8px 0;"><strong>Name:</strong> ${data.customerName}</p>
          <p style="margin: 8px 0;"><strong>Email:</strong> ${data.customerEmail}</p>
          ${data.customerPhone ? `<p style="margin: 8px 0;"><strong>Phone:</strong> ${data.customerPhone}</p>` : ''}
          <p style="margin: 8px 0;"><strong>Guests:</strong> ${guestDisplay}</p>
        </div>
        <div style="width: 48%; position: relative;">
          <h3 style="margin: 0 0 15px; border-bottom: 1px solid #D4AF37; padding-bottom: 8px; color: #D4AF37; font-size: 18px;">Receipt Details</h3>
          <p style="margin: 8px 0;"><strong>Receipt No:</strong> ${data.receiptNumber}</p>
          <p style="margin: 8px 0;"><strong>Transaction Date:</strong> ${transactionDateFormatted}</p>
          <p style="margin: 8px 0;"><strong>Payment Method:</strong> ${data.paymentMethod}</p>
          <p style="margin: 8px 0;"><strong>Transaction ID:</strong> ${data.paymentId}</p>
          ${data.qrCodeData ? `
            <div style="position: absolute; top: 0; right: 0;">
              <img src="${data.qrCodeData}" width="80" height="80" alt="QR Code" />
              <p style="text-align: center; font-size: 10px; margin-top: 2px;">Scan to visit our website</p>
            </div>
          ` : ''}
        </div>
      </div>
      
      <h3 style="margin: 30px 0 15px; border-bottom: 1px solid #D4AF37; padding-bottom: 8px; color: #D4AF37; font-size: 18px;">Booking Details</h3>
      <div style="margin-bottom: 25px; background-color: #f9f9f9; padding: 15px; border-radius: 5px; border-left: 3px solid #D4AF37;">
        <p style="margin: 8px 0;"><strong>Room:</strong> ${data.roomName}</p>
        <p style="margin: 8px 0;"><strong>Room Type:</strong> ${data.roomType || 'Standard'}</p>
        <p style="margin: 8px 0;"><strong>Rooms Booked:</strong> ${roomCountDisplay}</p>
        <p style="margin: 8px 0;"><strong>Check-in Date:</strong> ${checkInFormatted}</p>
        <p style="margin: 8px 0;"><strong>Check-out Date:</strong> ${checkOutFormatted}</p>
        <p style="margin: 8px 0;"><strong>Nights:</strong> ${data.nights || 1}</p>
      </div>
      
      <div style="background-color: #f9f9f9; border-radius: 5px; overflow: hidden; margin: 30px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #D4AF37;">
              <th style="text-align: left; padding: 12px 15px; color: #fff;">Description</th>
              <th style="text-align: right; padding: 12px 15px; color: #fff;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${data.pricePerNight ? `
            <tr>
              <td style="padding: 12px 15px; border-bottom: 1px solid #ddd;">Room Rate</td>
              <td style="text-align: right; padding: 12px 15px; border-bottom: 1px solid #ddd;">${formatCurrency(data.pricePerNight)} × ${roomCount} room${roomCount > 1 ? 's' : ''}</td>
            </tr>
            <tr>
              <td style="padding: 12px 15px; border-bottom: 1px solid #ddd;">Stay Duration</td>
              <td style="text-align: right; padding: 12px 15px; border-bottom: 1px solid #ddd;">${data.nights || 1} night${(data.nights || 1) > 1 ? 's' : ''}</td>
            </tr>
            <tr>
              <td style="padding: 12px 15px; border-bottom: 1px solid #ddd;">Room Total</td>
              <td style="text-align: right; padding: 12px 15px; border-bottom: 1px solid #ddd;">${formatCurrency((data.pricePerNight || 0) * roomCount * (data.nights || 1))}</td>
            </tr>
            ` : ''}
            ${breakfastInfo}
            ${promoCodeInfo}
            <tr>
              <td style="padding: 12px 15px; border-bottom: 1px solid #ddd;">Base Price</td>
              <td style="text-align: right; padding: 12px 15px; border-bottom: 1px solid #ddd;">${formatCurrency(data.price)}</td>
            </tr>
            ${taxBreakdown}
            <tr style="font-weight: bold; font-size: 1.1em; background-color: #f2f2f2;">
              <td style="padding: 12px 15px;">Total Paid</td>
              <td style="text-align: right; padding: 12px 15px;">${formatCurrency(data.total)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div style="margin-top: 40px; border-top: 1px dashed #D4AF37; padding-top: 20px; text-align: center;">
        <p style="font-family: 'Playfair Display', serif; font-size: 18px; color: #D4AF37; margin-bottom: 15px;">Thank you for choosing The Royal Pavilion</p>
        <p style="margin-bottom: 5px;">For any inquiries regarding this booking, please contact our reservations team:</p>
        <p style="margin-bottom: 15px;">${businessInfo.email} | ${businessInfo.phone}</p>
        
        ${termsAndConditionsHtml}
      </div>
      
      <div style="background: linear-gradient(to right, #D4AF37, #f9f0cc, #D4AF37); height: 10px; margin-top: 30px;"></div>
    </div>
  `;
};

/**
 * Creates a JSON representation of receipt data for storage
 */
export const createReceiptData = (data: ReceiptData): string => {
  // Keep tax values in the stored data for record-keeping
  return JSON.stringify(data);
};

/**
 * Parses stored receipt data back into an object
 */
export const parseReceiptData = (jsonData: string): ReceiptData => {
  try {
    const data = JSON.parse(jsonData);
    
    // Ensure all date fields are properly handled
    // We don't convert to Date objects here since they'll be formatted later
    
    return data;
  } catch (error) {
    console.error('Error parsing receipt data:', error);
    // Return a default/empty receipt data object
    return {
      bookingId: 'error',
      customerName: 'Error parsing receipt',
      customerEmail: '',
      roomName: '',
      roomType: '',
      checkInDate: new Date(),
      checkOutDate: new Date(),
      guests: 0,
      price: 0,
      tax: 0,
      total: 0,
      paymentMethod: '',
      paymentId: '',
      transactionDate: new Date(),
      receiptNumber: 'ERROR'
    };
  }
};

/**
 * Generates QR code data URL for check-in
 * This function is now properly exported
 */
export const generateQRCodeDataUrl = async (bookingId: string): Promise<string | null> => {
  try {
    // Dynamically import QRCode to ensure it's loaded correctly
    const QRCodeModule = await import('qrcode');
    if (!QRCodeModule || !QRCodeModule.toDataURL) {
      throw new Error('QRCode module not loaded correctly');
    }
    
    // Changed the URL from check-in link to the main website
    return await QRCodeModule.toDataURL(`https://theroyalpavilion.in`, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 150
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return null;
  }
};
