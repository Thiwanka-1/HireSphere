import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase with your .env credentials
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

/**
 * Uploads a Multer file buffer to Firebase Storage
 * @param {Object} file - The file object from Multer (req.file)
 * @returns {Promise<string>} - The public download URL of the uploaded file
 */
export const uploadResumeToFirebase = async (file) => {
    // Generate a unique, safe filename
    const dateTime = Date.now();
    const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9.]/g, "_");
    const fileName = `resumes/${dateTime}_${safeOriginalName}`;
    
    // Create a reference to the storage bucket
    const storageRef = ref(storage, fileName);

    // Upload the file buffer
    const metadata = {
        contentType: file.mimetype,
    };

    const snapshot = await uploadBytesResumable(storageRef, file.buffer, metadata);
    
    // Retrieve and return the public URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
};

/**
 * Deletes a file from Firebase Storage using its public URL
 * @param {string} fileUrl - The public download URL of the file
 */
export const deleteResumeFromFirebase = async (fileUrl) => {
    try {
        // Firebase Storage URLs are complex. We need to extract the actual file path.
        // Format: https://firebasestorage.googleapis.com/v0/b/[bucket]/o/[filePath]?alt=media...
        const decodedUrl = decodeURIComponent(fileUrl);
        const urlParts = decodedUrl.split('/o/');
        
        if (urlParts.length > 1) {
            // Remove the query parameters (everything after the '?')
            const filePathWithParams = urlParts[1];
            const filePath = filePathWithParams.split('?')[0]; 
            
            const storageRef = ref(storage, filePath);
            await deleteObject(storageRef);
            console.log(`✅ Successfully deleted resume from Firebase: ${filePath}`);
        }
    } catch (error) {
        // We log the error but don't crash the server, as the database record might still need deleting
        console.error('❌ Error deleting file from Firebase:', error.message);
    }
};