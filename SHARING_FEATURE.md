# 🔗 Note Sharing Feature

## Overview

Users can now generate unique, shareable links for their notes. Anyone with the link can view the note in a **read-only format** without requiring login. Notes support **code snippets with syntax highlighting**.

---

## ✨ Features

### **1. Shareable Links**
- ✅ Generate unique public URLs for any note
- ✅ Format: `/note/:shareId`
- ✅ No authentication required to view
- ✅ Read-only access for visitors

### **2. Code Syntax Highlighting**
- ✅ Support for multiple programming languages
- ✅ Automatic language detection from code blocks
- ✅ Line numbers display
- ✅ Dark and light themes
- ✅ Professional code rendering with `react-syntax-highlighter`

### **3. Preview Mode**
- ✅ Live preview while editing
- ✅ Toggle between Edit and Preview
- ✅ See exactly how shared note will look
- ✅ Code blocks render with syntax highlighting

### **4. Share Management**
- ✅ Visual "Shared" badge on shared notes
- ✅ Copy shareable link to clipboard
- ✅ Open shared view in new tab
- ✅ Share modal with link management

---

## 🚀 How to Use

### **Share a Note**

1. **Open a note** in the editor
2. **Click the Share icon** (network icon in header)
3. **Share modal appears** with unique URL
4. **Copy the link** or open in new tab
5. **Share with anyone** - no login required!

### **Write Code Blocks**

Use triple backticks with language name:

\`\`\`javascript
function greet(name) {
  console.log(`Hello, ${name}!`);
}
\`\`\`

\`\`\`python
def greet(name):
    print(f"Hello, {name}!")
\`\`\`

\`\`\`java
public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
\`\`\`

### **Preview Your Note**

1. Click **"Preview"** button in editor header
2. See formatted content with syntax highlighting
3. Click **"Edit"** to return to editing mode

### **View Shared Notes**

**Option 1: Direct URL**
- Anyone can visit: `https://yourapp.com/note/shareId`
- No login required
- Read-only view

**Option 2: From Dashboard (logged in)**
- Click share icon
- Click "Open Shared View"
- See public view of your note

---

## 📁 Technical Implementation

### **Files Created**

**1. `src/utils/shareNote.ts`**
```typescript
- generateShareId()        // Create unique ID
- shareNote(userId, note)  // Save to Firebase public path
- getSharedNote(shareId)   // Fetch public note (no auth)
- unshareNote(userId, note) // Remove from public access
- getShareableUrl(shareId) // Generate full URL
```

**2. `src/components/MarkdownRenderer.tsx`**
```typescript
- Parses markdown content
- Detects code blocks: ```language\ncode```
- Renders with syntax highlighting
- Supports dark/light themes
- Shows line numbers
```

### **Files Updated**

**3. `src/types/index.ts`**
```typescript
interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  isShared?: boolean;      // NEW
  shareId?: string;        // NEW
}
```

**4. `src/components/NoteEditor.tsx`**
- Added Preview/Edit toggle
- Added share modal UI
- Added share button with copy functionality
- Integrated MarkdownRenderer
- Shows "Shared" badge

**5. `src/pages/SharedNoteView.tsx`**
- Supports URL-based loading (shareId prop)
- Fetches public notes without auth
- Read-only display
- Loading and error states
- Dark mode support

**6. `src/App.tsx`**
- URL routing for `/note/:shareId`
- Handles public and authenticated access
- Share link generation
- Route management

---

## 🗄️ Firebase Structure

### **Public Shared Notes**
```javascript
{
  "sharedNotes": {
    "shareId-12345": {
      "title": "My Shared Note",
      "content": "Note content with ```code```",
      "createdAt": 1699123456789,
      "ownerId": "userId-abc123",
      "sharedAt": 1699123456790
    }
  }
}
```

### **User's Notes (with share info)**
```javascript
{
  "users": {
    "userId-abc123": {
      "notes": {
        "noteId-456": {
          "title": "My Note",
          "content": "Content...",
          "createdAt": 1699123456789,
          "updatedAt": 1699123456790,
          "isShared": true,
          "shareId": "shareId-12345"
        }
      }
    }
  }
}
```

---

## 🎨 Supported Languages

MarkdownRenderer supports syntax highlighting for:

- JavaScript / TypeScript
- Python
- Java
- C / C++ / C#
- Go
- Rust
- Ruby
- PHP
- Swift
- Kotlin
- HTML / CSS
- SQL
- Bash / Shell
- JSON / YAML
- Markdown
- And 100+ more!

---

## 🔒 Security & Privacy

### **Public Access**
- ✅ Shared notes are **read-only**
- ✅ Visitors **cannot edit** or delete
- ✅ No authentication required to view
- ✅ ShareId is unique and unpredictable

### **Firebase Rules (Update Required)**

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

**Important:** Update your Firebase Realtime Database rules to include the `sharedNotes` path!

---

## 📱 User Interface

### **Editor Header**

```
[Saved] [Shared Badge]          [Preview] [Share] [Delete]
```

### **Share Modal**

```
┌─────────────────────────────────────┐
│  Share Note                         │
├─────────────────────────────────────┤
│  Anyone with this link can view     │
│  this note in read-only mode.       │
│                                     │
│  [https://app.com/note/abc]  [Copy]│
│                                     │
│          [Close] [Open Shared View] │
└─────────────────────────────────────┘
```

### **Shared View (Public)**

```
┌──────────────────────────────────────┐
│  [Smart Note]         [Back to Dashboard] │  (if logged in)
├──────────────────────────────────────┤
│                                      │
│  Note Title                [Shared]  │
│  Published on Nov 12, 2025           │
│  ────────────────────────────────    │
│                                      │
│  Note content with formatting...     │
│                                      │
│  ┌────────────────────────────┐     │
│  │ javascript                  │     │
│  ├────────────────────────────┤     │
│  │ 1  function hello() {       │     │
│  │ 2    console.log("Hi!");    │     │
│  │ 3  }                        │     │
│  └────────────────────────────┘     │
│                                      │
│  📖 Read-only view with syntax       │
│     highlighting                     │
└──────────────────────────────────────┘
```

---

## 🧪 Testing

### **Test 1: Share a Note**

1. Create a new note
2. Add content with code block:
   ```
   ```javascript
   console.log("Hello!");
   ```
   ```
3. Click Share icon
4. ✅ Modal appears with unique URL
5. Click "Copy"
6. ✅ Link copied to clipboard

### **Test 2: Preview Mode**

1. Open a note with code
2. Click "Preview"
3. ✅ Code renders with syntax highlighting
4. ✅ Line numbers visible
5. Click "Edit"
6. ✅ Back to editable mode

### **Test 3: Public Access (No Login)**

1. Copy shared link
2. Open in incognito/private window
3. ✅ Note loads without login
4. ✅ Code highlighted properly
5. ✅ Cannot edit or delete
6. ✅ Shows "Read-only" notice

### **Test 4: Multiple Languages**

Create note with different languages:
```
```python
def hello():
    print("Hello!")
```

```java
public class Test {
    public static void main(String[] args) {
        System.out.println("Hello!");
    }
}
```
```

✅ Each renders with correct syntax highlighting

---

## 🎯 Usage Examples

### **Share Code Snippets**

Perfect for:
- Sharing code solutions
- Tutorial content
- Documentation with examples
- Technical blog posts
- Code reviews

### **Share Notes with Team**

Use cases:
- Meeting notes with code snippets
- API documentation
- Configuration examples
- Onboarding guides
- Project specifications

---

## 🔧 Configuration

### **Install Dependencies**

Already installed:
```bash
npm install react-syntax-highlighter @types/react-syntax-highlighter
```

### **Firebase Rules Update**

1. Go to Firebase Console
2. Select Realtime Database
3. Click "Rules" tab
4. Add `sharedNotes` section (see Security section)
5. Click "Publish"

---

## 🐛 Troubleshooting

### **Share Link Not Working**

**Problem:** 404 or note not found
**Solution:**
- Check Firebase rules updated
- Verify `sharedNotes` path exists
- Ensure note was saved before sharing

### **Code Not Highlighting**

**Problem:** Code shows as plain text
**Solution:**
- Check code block syntax: \`\`\`language
- Verify language name is correct
- Check react-syntax-highlighter installed

### **Preview Shows Raw Markdown**

**Problem:** Code blocks show as text
**Solution:**
- Use triple backticks (\`\`\`)
- Add language name after backticks
- Check MarkdownRenderer imported

---

## 📊 Supported Code Block Formats

### **Standard Format**
\`\`\`language
code here
\`\`\`

### **Without Language (fallback to text)**
\`\`\`
plain text
\`\`\`

### **Multiple Blocks in One Note**
\`\`\`javascript
// First block
console.log("JS");
\`\`\`

Some text between...

\`\`\`python
# Second block
print("Python")
\`\`\`

---

## 🚀 Future Enhancements

- [ ] Unshare notes (revoke public access)
- [ ] Share expiration dates
- [ ] Password-protected shares
- [ ] Share analytics (view count)
- [ ] Embed code for websites
- [ ] Social media sharing buttons
- [ ] QR code generation
- [ ] Custom share URLs

---

## 📚 Learn More

- [react-syntax-highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter)
- [Prism Themes](https://github.com/PrismJS/prism-themes)
- [Firebase RTDB Rules](https://firebase.google.com/docs/database/security)

---

## ✅ Summary

Your notes now support:
✅ **Public shareable links** - No login required
✅ **Code syntax highlighting** - 100+ languages
✅ **Preview mode** - See before sharing
✅ **Read-only access** - Secure viewing
✅ **Beautiful rendering** - Professional look

**Share your knowledge with the world!** 🌐
