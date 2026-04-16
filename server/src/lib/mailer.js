const nodemailer = require('nodemailer');

let cachedTransporter = null;

const createTransporter = () => {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const hasSmtpConfig = Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS);

  if (hasSmtpConfig) {
    cachedTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    return cachedTransporter;
  }

  cachedTransporter = nodemailer.createTransport({
    streamTransport: true,
    newline: 'unix',
    buffer: true,
  });

  return cachedTransporter;
};

const sendOrderConfirmationEmail = async ({ to, order, customerName }) => {
  if (!to) {
    return { delivered: false, reason: 'missing-recipient' };
  }

  const transporter = createTransporter();
  const itemLines = order.items.map((item) => `- ${item.product.name} x${item.quantity} (₹${Number(item.unitPrice).toFixed(2)})`).join('\n');
  const itemRows = order.items.map((item) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #eaeded;">${item.product.name}</td>
      <td style="padding:12px 0;border-bottom:1px solid #eaeded;text-align:center;">${item.quantity}</td>
      <td style="padding:12px 0;border-bottom:1px solid #eaeded;text-align:right;">₹${Number(item.unitPrice).toFixed(2)}</td>
    </tr>
  `).join('');
  const orderDate = new Date(order.placedAt || Date.now()).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const shippingAddress = order.shippingAddress || {};
  const addressLines = [shippingAddress.addressLine1, shippingAddress.addressLine2, shippingAddress.city, shippingAddress.state, shippingAddress.pincode]
    .filter(Boolean)
    .join(', ');

  const message = {
    from: process.env.MAIL_FROM || 'Amazon Clone <no-reply@amazon-clone.local>',
    to,
    subject: `Your Amazon Clone order ${order.id.slice(0, 8)} is confirmed`,
    text: `Hi ${customerName || 'there'},\n\nYour order has been placed successfully.\n\nOrder ID: ${order.id}\nPlaced: ${orderDate}\nStatus: ${order.status}\nShipping Address: ${addressLines || 'Not provided'}\nSubtotal: ₹${Number(order.subtotal).toFixed(2)}\nShipping: ₹${Number(order.shippingCost).toFixed(2)}\nTotal: ₹${Number(order.total).toFixed(2)}\n\nItems:\n${itemLines}\n\nThanks for shopping with Amazon Clone.`,
    html: `
      <div style="margin:0;padding:0;background:#eaeded;font-family:Arial,Helvetica,sans-serif;color:#111;">
        <div style="max-width:640px;margin:0 auto;background:#fff;border:1px solid #d5d9d9;border-radius:10px;overflow:hidden;">
          <div style="background:#131921;color:#fff;padding:20px 24px;">
            <div style="font-size:22px;font-weight:700;letter-spacing:.3px;">Amazon Clone</div>
            <div style="font-size:13px;color:#cfd4da;margin-top:4px;">Order confirmation</div>
          </div>
          <div style="padding:24px;">
            <p style="margin:0 0 16px;font-size:16px;">Hi ${customerName || 'there'},</p>
            <p style="margin:0 0 20px;font-size:14px;line-height:1.5;color:#333;">Your order has been confirmed. We’ll send updates as it moves through processing, shipping, and delivery.</p>
            <div style="background:#f8fafa;border:1px solid #eaeded;border-radius:8px;padding:16px;margin-bottom:20px;">
              <div style="display:flex;flex-wrap:wrap;gap:16px;justify-content:space-between;font-size:13px;">
                <div><strong>Order ID</strong><div>${order.id}</div></div>
                <div><strong>Placed</strong><div>${orderDate}</div></div>
                <div><strong>Status</strong><div>${order.status}</div></div>
              </div>
            </div>
            <div style="margin-bottom:20px;">
              <div style="font-size:14px;font-weight:700;margin-bottom:6px;">Shipping address</div>
              <div style="font-size:14px;color:#333;line-height:1.5;">${addressLines || 'Not provided'}</div>
            </div>
            <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:18px;">
              <thead>
                <tr>
                  <th style="text-align:left;padding-bottom:10px;border-bottom:2px solid #232f3e;">Item</th>
                  <th style="text-align:center;padding-bottom:10px;border-bottom:2px solid #232f3e;">Qty</th>
                  <th style="text-align:right;padding-bottom:10px;border-bottom:2px solid #232f3e;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemRows}
              </tbody>
            </table>
            <div style="margin-left:auto;max-width:260px;font-size:14px;line-height:1.8;">
              <div style="display:flex;justify-content:space-between;"><span>Subtotal</span><span>₹${Number(order.subtotal).toFixed(2)}</span></div>
              <div style="display:flex;justify-content:space-between;"><span>Shipping</span><span>₹${Number(order.shippingCost).toFixed(2)}</span></div>
              <div style="display:flex;justify-content:space-between;font-size:16px;font-weight:700;border-top:1px solid #eaeded;padding-top:8px;margin-top:4px;"><span>Total</span><span>₹${Number(order.total).toFixed(2)}</span></div>
            </div>
            <div style="margin-top:22px;font-size:13px;color:#565959;line-height:1.5;">Thanks for shopping with Amazon Clone.</div>
          </div>
        </div>
      </div>
    `,
  };

  const info = await transporter.sendMail(message);
  return {
    delivered: true,
    messageId: info.messageId || null,
    preview: info.message ? info.message.toString('utf8') : null,
  };
};

module.exports = { sendOrderConfirmationEmail };
