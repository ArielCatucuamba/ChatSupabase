import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { initializeApp } from 'firebase/app';

import { AppModule } from './app/app.module';

const firebaseConfig = {
  apiKey: "AIzaSyBJMUpW1XXZovTRRS-RAiIMcc-YR3D5xPs",
  authDomain: "a-f5b30.firebaseapp.com",
  projectId: "a-f5b30",
  storageBucket: "a-f5b30.firebasestorage.app",
  messagingSenderId: "515020313650",
  appId: "1:515020313650:web:7d3688d99fec26b64ed82b",
  measurementId: "G-XGVYYTQ6HT"
};

initializeApp(firebaseConfig);

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.log(err));
