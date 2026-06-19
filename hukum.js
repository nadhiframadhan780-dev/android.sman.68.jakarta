// Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDAcKcg3alPOTH3FFGelYmsW7jcMMe2PLI",
    authDomain: "upnvjdatsystem.firebaseapp.com",
    projectId: "upnvjdatsystem",
    storageBucket: "upnvjdatsystem.firebasestorage.app",
    messagingSenderId: "57095309946",
    appId: "1:57095309946:web:b0e9f3f86380d549ffc9c3"
};
firebase.initializeApp(firebaseConfig);

// Preloader
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.getElementById('preloader')?.classList.add('hide');
    }, 400);
});

console.log('✅ Tata Tertib & Hukum SMAN 68 Jakarta - Loaded');