# Payment Gateway Configuration

## Overview
VenueKart uses Razorpay as the payment gateway with restricted payment methods for a streamlined user experience.

## Enabled Payment Methods

### ✅ Available Payment Options:
1. **Credit & Debit Cards**
   - Visa, Mastercard, Rupay, American Express
   - Both domestic and international cards

2. **UPI (Unified Payments Interface)**
   - Google Pay, PhonePe, Paytm, BHIM
   - QR code and VPA-based payments

3. **Net Banking**
   - All major Indian banks
   - Real-time bank transfers

### ❌ Disabled Payment Options:
- Digital Wallets (Paytm, Mobikwik, etc.)
- EMI options
- Pay Later services
- Cryptocurrency

## Technical Configuration

The payment method restrictions are configured in `client/components/RazorpayPayment.jsx`:

```javascript
method: {
  netbanking: true,
  card: true,
  upi: true,
  wallet: false,
  emi: false,
  paylater: false
}
```

## User Experience Features

1. **Clear Payment Method Display**: Users see available options before initiating payment
2. **Organized Interface**: Payment methods are grouped logically
3. **Security Assurance**: Clear messaging about payment security
4. **Mobile Optimized**: Responsive design for all devices

## Testing

Use Razorpay test credentials for testing:
- **Test Cards**: 4111 1111 1111 1111
- **Test UPI**: success@razorpay
- **Test Net Banking**: Use test bank accounts provided by Razorpay

## Security

- All payments are processed securely through Razorpay
- PCI DSS compliant payment processing
- End-to-end encryption for all transactions
- Signature verification for payment confirmation

## Future Enhancements

- **Save Cards**: Option to save cards for future payments
- **Auto-retry**: Automatic retry for failed payments
- **Payment Analytics**: Detailed payment method usage analytics
