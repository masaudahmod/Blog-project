const newsletterSubscriptionMail = (email) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Newsletter Subscription</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      color: #333333;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .email-header {
      background-color: #2563eb;
      color: #ffffff;
      padding: 20px;
      text-align: center;
    }
    .email-body {
      padding: 20px;
    }
    .email-body h2 {
      margin-top: 0;
      color: #2563eb;
    }
    .email-footer {
      background-color: #f9f9f9;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #888888;
    }
    .btn {
      display: inline-block;
      padding: 10px 20px;
      color: #ffffff;
      background-color: #2563eb;
      text-decoration: none;
      border-radius: 5px;
      margin-top: 20px;
      font-size: 16px;
    }
    .btn:hover {
      background-color: #1e40af;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>Welcome to Our Newsletter 🎉</h1>
    </div>

    <div class="email-body">
      <h2>Hello "there",</h2>
      <p>
        Thank you for subscribing to our newsletter!
        You’ll now receive the latest updates, news, and exclusive content directly in your inbox.
      </p>

      <p>
        We promise not to spam you and you can unsubscribe anytime.
      </p>

      <a href="[WEBSITE_LINK]" class="btn">Visit Our Website</a>

      <p style="margin-top: 20px;">
        Stay tuned for exciting updates 🚀
      </p>
    </div>

    <div class="email-footer">
      <p>&copy; ${new Date().getFullYear()} Blog Web App. All rights reserved.</p>
      <p>This is an automated email. Please do not reply.</p>
    </div>
  </div>
</body>
</html>`;
};

export { newsletterSubscriptionMail };
