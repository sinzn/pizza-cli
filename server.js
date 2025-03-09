const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com', // Replace with your Gmail email
    pass: 'your-app-password' // Replace with your Gmail app password
  }
});

app.post('/api/send-email', async (req, res) => {
  try {
    const { email, orderId, type, size, pizza } = req.body;
    const basePrice = type === 'veg' ? 
      {
        'margherita': 12.99,
        'mushroom supreme': 14.99,
        'veggie paradise': 15.99,
        'garden delight': 13.99
      }[pizza] :
      {
        'pepperoni': 14.99,
        'chicken supreme': 16.99,
        'meat lovers': 17.99,
        'bbq chicken': 15.99
      }[pizza];
    
    const sizeMultiplier = {
      small: 1,
      medium: 1.2,
      large: 1.4
    }[size];
    
    const finalPrice = (basePrice * sizeMultiplier).toFixed(2);

    // Send email
    const mailOptions = {
      from: '"Pizza Paradise 🍕" <your-email@gmail.com>',
      to: email,
      subject: `Order Confirmation #${orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4a0404; text-align: center;">Thank you for your order!</h1>
          <div style="background-color: #f8f8f8; padding: 20px; border-radius: 8px;">
            <h2 style="color: #333;">Order Details:</h2>
            <ul style="list-style: none; padding: 0;">
              <li style="margin: 10px 0;"><strong>Order ID:</strong> ${orderId}</li>
              <li style="margin: 10px 0;"><strong>Pizza:</strong> ${pizza.charAt(0).toUpperCase() + pizza.slice(1)}</li>
              <li style="margin: 10px 0;"><strong>Type:</strong> ${type === 'veg' ? 'Vegetarian' : 'Non-vegetarian'}</li>
              <li style="margin: 10px 0;"><strong>Size:</strong> ${size.charAt(0).toUpperCase() + size.slice(1)}</li>
              <li style="margin: 10px 0;"><strong>Price:</strong> $${finalPrice}</li>
            </ul>
            <div style="text-align: center; margin-top: 20px;">
              <a href="http://localhost:${port}/tracking.html?orderId=${orderId}" 
                 style="background-color: #4a0404; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                Track Your Order
              </a>
            </div>
          </div>
          <p style="text-align: center; margin-top: 20px; color: #666;">
            Thank you for choosing Pizza Paradise! 🍕
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});