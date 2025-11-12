# Smart Note App

A modern, feature-rich note-taking application with **offline-first architecture**, Firebase authentication, and real-time synchronization.

## ✨ Features

### **Core Functionality**
- ✅ **100% Offline Support** - Works completely without internet
- ✅ **Create, Read, Update, Delete** - Full CRUD operations
- ✅ **Instant Performance** - Notes load in milliseconds
- ✅ **Persistent Storage** - Survives browser refresh, closure, restart
- ✅ **Real-Time Sync** - Changes sync across devices instantly
- ✅ **Search & Filter** - Find notes quickly
- ✅ **Dark Mode** - Eye-friendly theme

### **Storage & Sync**
- 📦 **IndexedDB** - Local browser storage for offline access
- 🔥 **Firebase RTDB** - Cloud storage for multi-device sync
- 🔄 **Automatic Sync** - Seamlessly syncs when back online
- 📴 **Offline Queue** - Queues changes made offline

### **Authentication**
- 🔐 **Firebase Auth** - Secure email/password authentication
- 👤 **User Accounts** - Personal note storage per user
- 🔒 **Data Privacy** - Users can only access their own notes

### **User Experience**
- 🎨 **Modern UI** - Clean, intuitive interface with Tailwind CSS
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 📱 **Responsive** - Works on desktop, tablet, and mobile
- ⚡ **Optimistic Updates** - Instant UI feedback
- 🟢 **Network Indicator** - Shows online/offline/syncing status

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js 16+ installed
- Firebase project set up

### **Installation**

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Thamel777/smart-note-app.git
   cd smart-note-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Firebase:**
   - Copy `.env.example` to `.env`
   - Add your Firebase credentials to `.env`

4. **Run the app:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   ```
   http://localhost:5173
   ```

---

## 🗄️ Storage Architecture

### **Offline-First Design**
```
User Action
    ↓
IndexedDB (Instant Save)
    ↓
Sync Queue (if offline)
    ↓
Firebase RTDB (when online)
    ↓
Real-Time Sync Across Devices
```

### **Benefits**
- ⚡ **Instant operations** - No network latency
- 📴 **Works offline** - Complete functionality without internet
- 💾 **Persistent** - Data survives browser restarts
- 🔄 **Auto-sync** - Changes sync automatically when online
- 🎯 **Reliable** - Multiple layers of data protection

---

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── NoteCard.tsx
│   ├── NoteEditor.tsx
│   └── icons/
├── pages/              # Main app views
│   ├── AuthScreen.tsx
│   ├── Dashboard.tsx
│   └── SharedNoteView.tsx
├── hooks/              # Custom React hooks
│   ├── useAuth.ts      # Authentication state
│   ├── useNotes.ts     # Note management with offline support
│   └── useNetworkStatus.ts  # Online/offline detection
├── utils/              # Helper functions
│   ├── auth.ts         # Authentication utilities
│   ├── firebaseSync.ts # Firebase operations
│   └── indexedDB.ts    # Local storage operations
├── config/
│   └── firebase.ts     # Firebase initialization
└── types/
    └── index.ts        # TypeScript types
```

---

## 🔧 Configuration

### **Firebase Setup**

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)

2. Enable Authentication:
   - Go to Authentication → Sign-in method
   - Enable "Email/Password"

3. Enable Realtime Database:
   - Go to Realtime Database
   - Create database in test mode

4. Copy credentials to `.env`:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

### **Security Rules (Firebase RTDB)**
```json
{
  "rules": {
    "users": {
      "$userId": {
        ".read": "$userId === auth.uid",
        ".write": "$userId === auth.uid"
      }
    },
    "sharedNotes": {
      "$shareId": {
        ".read": true,
        ".write": "auth != null"
      }
    }
  }
}
```

---

## 🧪 Testing Offline Mode

### **Test in Browser:**
1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Set throttling to "Offline"
4. Create/edit/delete notes
5. ✅ Everything works!
6. Go back "Online"
7. ✅ Changes sync automatically

### **Test Persistence:**
1. Create notes
2. Close browser completely
3. Reopen and sign in
4. ✅ All notes still there

---

## 🛠️ Tech Stack

- **Frontend:** React 19 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (CDN)
- **Authentication:** Firebase Auth
- **Cloud Storage:** Firebase Realtime Database
- **Local Storage:** IndexedDB
- **Network Detection:** Navigator API

---

## 🎯 Roadmap

- [ ] Rich text editor with markdown support
- [ ] Note sharing with other users
- [ ] Note categories/tags
- [ ] File attachments
- [ ] Export to PDF/Markdown
- [ ] Progressive Web App (PWA)
- [ ] Desktop app (Electron)

---

## 🐛 Troubleshooting

### **Notes not saving offline**
- Check if IndexedDB is enabled in browser settings
- Make sure not in Incognito/Private mode
- Check browser console for errors

### **Sync not working**
- Verify Firebase credentials in `.env`
- Check Firebase Console for database rules
- Ensure Realtime Database is enabled

### **Performance issues**
- Check IndexedDB size in DevTools (Application → Storage)
- Clear sync queue if stuck
- Refresh browser

---

## 📝 License

MIT License - feel free to use this project for learning and development!

---

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a PR.

---

## 📧 Support

- Issues: [GitHub Issues](https://github.com/Thamel777/smart-note-app/issues)
- Docs: Check the documentation files in the repo

---

**Built with ❤️ for offline-first productivity**
