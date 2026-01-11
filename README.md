# DP Banner Generator

A modern, self-hosted platform that allows organizations to create viral "Get DP" campaigns. Admins upload designs and define layout rules; users upload their photos to generate branded images instantly.

![App Preview](https://placehold.co/800x400/1e293b/ffffff?text=DP+Generator+Preview)

## ✨ Features

- **Admin Builder:** Visual drag-and-drop editor to define where user photos and names appear on the flyer.
- **Client-Side Generation:** Zero server cost for image processing. Everything happens in the user's browser using HTML5 Canvas.
- **Privacy Focused:** User photos are processed locally and never stored on the server.
- **Mobile First:** Touch-friendly interface with pinch-to-zoom and drag support.
- **Modern UI:** Glassmorphism design system using Tailwind CSS v4 and Framer Motion.
- **Instant Sharing:** Native mobile share sheet integration (Web Share API).

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion
- **Graphics Engine:** Konva.js / React-Konva
- **Backend/Storage:** Firebase (Firestore & Storage)

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- A Firebase Project

### Installation

1. **Clone the repository**
   ```bash
   git clone [https://github.com/YOUR_USERNAME/dp-generator.git](https://github.com/YOUR_USERNAME/dp-generator.git)
   cd dp-generator

```

2. **Install dependencies**
```bash
npm install

```


3. **Configure Environment**
Create a `.env` file in the root directory and add your Firebase keys:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

```


4. **Run Development Server**
```bash
npm run dev

```



## 📦 Deployment (Vercel)

1. Push your code to GitHub.
2. Import the project into Vercel.
3. **Critical:** In Vercel Project Settings > Environment Variables, copy and paste all the keys from your `.env` file.
4. Deploy!

## 🛡️ Security

* **Storage Rules:** Configured to allow public read/write only to the `campaign_flyers` folder.
* **Firestore Rules:** Configured to segregate campaign data.

```

**Save the file and commit it:**
```bash
git add README.md
git commit -m "docs: add project documentation"
git push