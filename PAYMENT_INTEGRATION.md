# FreshNest Payment Integration Guide

## Payment Methods Supported

### 1. **Credit/Debit Card** 💳
- Visa, Mastercard, American Express
- Secure 3D Authentication
- CVV verification
- Integration with Razorpay/Stripe

### 2. **UPI (Unified Payments Interface)** 📱
- Google Pay
- PhonePe
- Paytm
- BHIM
- Integration with Razorpay/PayU

### 3. **Cash on Delivery (COD)** 💵
- No online payment required
- Pay to delivery partner
- Order confirmation via SMS/Email

### 4. **FreshNest Wallet** 👛
- Store money in wallet
- Instant payments
- Cashback rewards
- Transaction history

---

## Payment Gateway Integration

### Recommended: Razorpay (For India)

**Why Razorpay?**
- Supports all major payment methods
- Low transaction fees (1.5-2%)
- Easy integration
- Instant settlements
- Great support

**Setup Steps:**

1. **Create Razorpay Account**
   - Visit: https://razorpay.com
   - Sign up and verify email
   - Complete KYC verification

2. **Get API Keys**
   - Dashboard → Settings → API Keys
   - Copy Key ID and Key Secret

3. **Install Razorpay SDK**
   ```bash
   npm install razorpay
   ```

4. **Environment Setup**
   ```bash
   VITE_RAZORPAY_KEY_ID=your_key_id_here
   VITE_RAZORPAY_KEY_SECRET=your_key_secret_here
   ```

5. **Backend Endpoint** (Node.js/Express)
   ```javascript
   const Razorpay = require('razorpay');

   const razorpay = new Razorpay({
     key_id: process.env.RAZORPAY_KEY_ID,
     key_secret: process.env.RAZORPAY_KEY_SECRET,
   });
   ```

---

## Implementation Flow

### Step 1: Create Order
```typescript
// Backend
const order = await razorpay.orders.create({
  amount: totalAmount * 100, // Amount in paise
  currency: 'INR',
  receipt: 'order-id',
});
```

### Step 2: Frontend Payment
```typescript
// React Component
const options = {
  key: process.env.VITE_RAZORPAY_KEY_ID,
  amount: order.amount,
  currency: 'INR',
  name: 'FreshNest',
  description: 'Fresh Grocery Delivery',
  order_id: order.id,
  handler: handlePaymentSuccess,
  prefill: {
    name: user.name,
    email: user.email,
    contact: user.phone,
  },
};

const rzp = new window.Razorpay(options);
rzp.open();
```

### Step 3: Verify Payment
```typescript
// Backend - Verify signature
const shasum = crypto
  .createHmac('sha256', KEY_SECRET)
  .update(razorpay_order_id + '|' + razorpay_payment_id)
  .digest('hex');

if (shasum === razorpay_signature) {
  // Payment verified
  updateOrderStatus('success');
}
```

---

## Security Best Practices

✅ **Always:**
- Use HTTPS only
- Store API keys in environment variables
- Never expose secret keys in frontend
- Verify payments on backend
- Use strong encryption
- Implement rate limiting
- Log all transactions

❌ **Never:**
- Share API credentials
- Store card details locally
- Send sensitive data via email
- Log sensitive payment info
- Trust client-side payment verification

---

## Transaction Fees Breakdown

| Method | Fee | Processing Time |
|--------|-----|-----------------|
| Razorpay | 1.5-2% | Instant |
| Stripe | 2.9% + $0.30 | 1-2 days |
| PayU | 1.5-2% | Instant |
| COD | Flat ₹0 | N/A |
| Wallet | 0% | Instant |

---

## Revenue Model

### Recommended Pricing

1. **Commission on Orders**: 5-10% per order
2. **Delivery Fee**: ₹50-100 per order
3. **Wallet Charges**: 2-3% processing fee
4. **Featured Products**: ₹500-1000 per day
5. **Premium Farmer Account**: ₹999/month

### Example Order Breakdown

```
Order Amount:           ₹500
Delivery Fee:          +₹50
Platform Fee (2%):     +₹10
---
Grand Total:           ₹560

FreshNest Revenue:
- Commission (8%):      ₹40
- Delivery (split):     ₹25
- Platform Fee:         ₹10
---
Total Revenue:         ₹75 (13.4% margin)
```

---

## Testing

### Test Card Numbers (Razorpay)

**Success:**
- Card: 4111 1111 1111 1111
- Expiry: Any future date
- CVV: Any 3 digits

**Failed Payment:**
- Card: 5105 1051 0510 5100

---

## Compliance & Regulations

✅ **RBI Guidelines**
- PCI DSS Compliance
- 2FA for transactions
- Fraud detection
- Transaction monitoring

✅ **Tax Compliance**
- GST Registration (18%)
- TDS on payments
- Monthly reporting

---

## Contact & Support

**Razorpay Support:**
- Email: support@razorpay.com
- Phone: 1800-180-2400
- Chat: https://razorpay.com/support

**FreshNest Support:**
- Email: contact.freshnest123@gmail.com
- Phone: +91 9652960912
