
/**
 * QR Code generation utility functions
 */

/**
 * Generates a QR code data URL for the given booking ID
 * @param bookingId The booking ID to encode in the QR code
 * @returns A promise that resolves to a data URL string or null if there's an error
 */
export const generateQRCodeDataUrl = async (bookingId: string): Promise<string | null> => {
  try {
    // Dynamically import QRCode to ensure it's loaded correctly
    const QRCodeModule = await import('qrcode');
    if (!QRCodeModule || !QRCodeModule.toDataURL) {
      throw new Error('QRCode module not loaded correctly');
    }
    
    // Create a QR code that links to the hotel website
    // In a real application, this could link to a booking verification page
    return await QRCodeModule.toDataURL(`https://theroyalpavilion.in/booking/${bookingId}`, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 150
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return null;
  }
};
