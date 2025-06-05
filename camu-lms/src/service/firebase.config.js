import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, isSupported} from 'firebase/messaging';

const config = {  
    // Firebase
    FIREBASE_API_KEY: "AIzaSyC9wOx8yNVvjf2z7AHxAqMnCGWMGitrQJo",
    FIREBASE_AUTH_DOMAIN: "camuweb-d9df1.firebaseapp.com",
    FIREBASE_PROJECT_ID: "camuweb-d9df1",
    FIREBASE_STORAGE_BUCKET: "camuweb-d9df1.appspot.com",
    FIREBASE_MESSAGING_SENDER_ID:"614746299795",
    FIREBASE_APP_ID: "1:614746299795:web:ba0dabd0cc03ebcc195c66",
    FIREBASE_VAPID_KEY: "BPtGqGeHnpTiSxIQgzXiaugoP_8TWjkOmP5PgYTRwUS0eUYt2c7pWz_BceVigiG6C-d_Py2IHhQMjkJCK7QvG7o",
  };

const isSecureConnect =( window.location.protocol === 'https:' || window.location.hostname === 'localhost') && !(/iPad|iPhone|iPod/.test(navigator.userAgent))

const firebaseConfig = {
    apiKey: config.FIREBASE_API_KEY,
    authDomain: config.FIREBASE_AUTH_DOMAIN,
    projectId: config.FIREBASE_PROJECT_ID,
    storageBucket: config.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: config.FIREBASE_MESSAGING_SENDER_ID,
    appId: config.FIREBASE_APP_ID,
  };

let supported = false;
let messaging = null;
const checkMessagingSupport = async () => {
	supported = await isSupported();
	console.log('isSupported value:', supported);

	if (isSecureConnect && supported) {
		const app = initializeApp(firebaseConfig);
		messaging = getMessaging(app);
	}

	console.log('App initialized:', !!messaging);
};

const messagingInitialized = checkMessagingSupport();

// const app = isSecureConnect ? initializeApp(firebaseConfig) : null;
// export const messaging = isSecureConnect ? getMessaging(app) : null;
export const getIsSupported = isSupported;
export const getFCMToken = async () => {
    try {
      await messagingInitialized;
      if(isSecureConnect){
        const token = await getToken(messaging, {
          vapidKey: config.FIREBASE_VAPID_KEY,
        });
        return token;
      }else{
        return null
      }
        
    } catch (error) {
      console.error(error);
      return null;
    }
};

export { messaging };