# TinyMCE Editor Setup Guide

## 🎯 Getting a FREE TinyMCE API Key

### Step 1: Sign Up for Free Account
1. Visit: **https://www.tiny.cloud/auth/signup/**
2. Create a free account (no credit card required)
3. Verify your email address

### Step 2: Get Your API Key
1. Log in to your TinyMCE account dashboard
2. Navigate to **"API Keys"** section
3. Copy your API key (it looks like: `abc123xyz456...`)

### Step 3: Add API Key to Your Project

1. **Create `.env.local` file** in the `dashboard` folder (if it doesn't exist):
   ```bash
   cd dashboard
   touch .env.local
   ```

2. **Add your API key** to `.env.local`:
   ```env
   NEXT_PUBLIC_TINYMCE_API_KEY=your-actual-api-key-here
   ```

3. **Restart your development server**:
   ```bash
   npm run dev
   ```

## ✅ Verification

After adding the API key:
- The editor should load without warnings
- All features should work properly
- No "Invalid API Key" messages

## 🔄 Alternative: Self-Hosted (No API Key)

If you prefer not to use an API key, the editor will automatically use the self-hosted GPL license. However, you may see warnings in the console.

To use self-hosted mode explicitly:
- Simply don't set `NEXT_PUBLIC_TINYMCE_API_KEY` in your `.env.local`
- The component will automatically use `license_key: "gpl"`

## 📝 Notes

- **Free Tier**: The free API key includes:
  - Full editor functionality
  - All standard plugins
  - Cloud-hosted CDN
  - No usage limits for reasonable use

- **Environment Variables**:
  - Use `.env.local` for local development (not committed to git)
  - Use your hosting platform's environment variables for production
  - The `NEXT_PUBLIC_` prefix makes it available in the browser

## 🚀 Production Deployment

When deploying to production:
1. Add `NEXT_PUBLIC_TINYMCE_API_KEY` to your hosting platform's environment variables
2. Restart your application
3. The editor will use the API key automatically

## ❓ Troubleshooting

**Editor shows "Invalid API Key" warning:**
- Check that your API key is correct
- Ensure `.env.local` is in the `dashboard` folder
- Restart your dev server after adding the key
- Check that the variable name is exactly `NEXT_PUBLIC_TINYMCE_API_KEY`

**Editor not loading:**
- Check browser console for errors
- Verify `@tinymce/tinymce-react` is installed: `npm list @tinymce/tinymce-react`
- Try clearing browser cache

## 🔗 Useful Links

- [TinyMCE Sign Up](https://www.tiny.cloud/auth/signup/)
- [TinyMCE Documentation](https://www.tiny.cloud/docs/)
- [API Key Management](https://www.tiny.cloud/my-account/dashboard/)
