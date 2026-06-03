import { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, doc, setDoc } from "./firebaseConfig.js";

document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signup-form');
  const loginForm = document.getElementById('login-form');

  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const btn = document.getElementById('signup-btn');
      const errorEl = document.getElementById('signup-error');
      
      const name = document.getElementById('signup-name').value;
      const email = document.getElementById('signup-email').value;
      const phone = document.getElementById('signup-phone').value;
      const address = document.getElementById('signup-address').value;
      const password = document.getElementById('signup-password').value;
      
      try {
        btn.disabled = true;
        btn.textContent = "Creating Account...";
        errorEl.style.display = 'none';

        // 1. Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Save additional data to Firestore
        await setDoc(doc(db, "users", user.uid), {
          name,
          email,
          phone,
          address,
          role: "user", // default role
          createdAt: new Date().toISOString()
        });

        // 3. Redirect to dashboard
        window.location.href = "/dashboard";
        
      } catch (error) {
        console.error("Signup error:", error);
        errorEl.textContent = error.message;
        errorEl.style.display = 'block';
        btn.disabled = false;
        btn.textContent = "Sign Up";
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const btn = document.getElementById('login-btn');
      const errorEl = document.getElementById('login-error');
      
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      
      try {
        btn.disabled = true;
        btn.textContent = "Logging In...";
        errorEl.style.display = 'none';

        await signInWithEmailAndPassword(auth, email, password);
        
        // Redirect to dashboard
        window.location.href = "/dashboard";
        
      } catch (error) {
        console.error("Login error:", error);
        errorEl.textContent = "Invalid email or password.";
        errorEl.style.display = 'block';
        btn.disabled = false;
        btn.textContent = "Log In";
      }
    });
  }
});
