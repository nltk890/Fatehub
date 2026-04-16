# FateHub Frontend

The premium community hub for Fate enthusiasts. Build with React, TypeScript, and Vite.

## 🚀 Features
- **Smart Points Economy**: Claim video codes and daily rewards.
- **Secure Store**: Buy exclusive wallpapers and assets via a secure Cloudflare Worker proxy.
- **Support Tickets**: Integrated Firebase ticketing system for user help.
- **Live Leaderboard**: Real-time rankings of top community supporters.

## 🛠️ Development

### Prerequisites
- Node.js 20+
- A running instance of the [FateHub Worker](../workers/)

### Local Setup
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with the following variables:
   ```env
   VITE_API_URL=http://localhost:8787
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_ADMIN_UID=your-admin-uid
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 📦 Deployment

### Automated (GitHub Actions)
This project is configured for automated deployment to GitHub Pages.
Simply push to the `main` branch, and the **Build and Deploy** workflow will handle the rest.

### Environment Secrets
Ensure the following secrets are set in your GitHub Repository (**Settings > Secrets and variables > Actions**):
- `VITE_API_URL`: The URL of your live Cloudflare Worker.
- `VITE_FIREBASE_PROJECT_ID`: Your Firebase Project ID.
- `VITE_ADMIN_UID`: Your Firebase Admin UID for admin panel access.

## 📄 License
Custom license for FateHub. All assets and produced edits are property of the creator.
