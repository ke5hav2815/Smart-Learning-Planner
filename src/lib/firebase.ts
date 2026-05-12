import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Critical: Test connection as per guidelines
async function testConnection() {
  try {
    const testDoc = doc(db, "_connection_test_", "ping");
    await getDocFromServer(testDoc);
  } catch (error) {
    if (error instanceof Error && error.message.includes("offline")) {
      console.error("Firebase is offline. Please check your configuration.");
    }
  }
}
testConnection();
