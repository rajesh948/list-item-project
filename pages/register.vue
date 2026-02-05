<template>
  <ion-page>
    <ion-content class="register-page">
      <div class="register-container">
        <div class="register-card">
          <!-- Logo Section -->
          <div class="logo-section">
            <div class="app-logo">
              <ion-icon :icon="restaurantOutline" class="logo-icon"></ion-icon>
            </div>
            <h1 class="app-name">CaterHub</h1>
            <p class="app-tagline">Professional Catering Management Platform</p>
          </div>

          <!-- Success Message -->
          <div v-if="registrationSuccess" class="form-container">
            <div class="success-container">
              <div class="success-icon-wrapper">
                <ion-icon :icon="checkmarkCircleOutline" class="success-icon"></ion-icon>
              </div>
              <h2 class="success-title">Registration Successful!</h2>
              <p class="success-message">
                We've sent a verification email to <strong>{{ registeredEmail }}</strong>.
                Please check your inbox and click the verification link to activate your account.
              </p>
              <p class="success-note">
                Don't see the email? Check your spam folder or wait a few minutes.
              </p>
              <NuxtLink to="/login" class="back-to-login-btn">
                <ion-icon :icon="arrowBackOutline"></ion-icon>
                Back to Login
              </NuxtLink>
            </div>
          </div>

          <!-- Registration Form -->
          <div v-else class="form-container">
            <h2 class="form-title">Create Account</h2>
            <p class="form-subtitle">Join CaterHub today</p>

            <form @submit.prevent="handleRegister" class="register-form">
              <div class="input-group">
                <label class="input-label">Email Address *</label>
                <div class="input-wrapper">
                  <ion-icon :icon="mailOutline" class="input-icon"></ion-icon>
                  <input
                    v-model="email"
                    type="email"
                    class="form-input"
                    placeholder="Enter your email"
                    required
                    autocomplete="email"
                  />
                </div>
              </div>

              <div class="input-group">
                <label class="input-label">Password *</label>
                <div class="input-wrapper">
                  <ion-icon :icon="lockClosedOutline" class="input-icon"></ion-icon>
                  <input
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    class="form-input"
                    placeholder="Create a password (min. 6 characters)"
                    required
                    minlength="6"
                    autocomplete="new-password"
                  />
                  <ion-icon
                    :icon="showPassword ? eyeOffOutline : eyeOutline"
                    @click="showPassword = !showPassword"
                    class="password-toggle-icon"
                  ></ion-icon>
                </div>
              </div>

              <div class="input-group">
                <label class="input-label">Confirm Password *</label>
                <div class="input-wrapper">
                  <ion-icon :icon="lockClosedOutline" class="input-icon"></ion-icon>
                  <input
                    v-model="confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    class="form-input"
                    placeholder="Confirm your password"
                    required
                    minlength="6"
                    autocomplete="new-password"
                  />
                  <ion-icon
                    :icon="showConfirmPassword ? eyeOffOutline : eyeOutline"
                    @click="showConfirmPassword = !showConfirmPassword"
                    class="password-toggle-icon"
                  ></ion-icon>
                </div>
              </div>

              <div class="input-group">
                <label class="input-label">Business Name (Optional)</label>
                <div class="input-wrapper">
                  <ion-icon :icon="businessOutline" class="input-icon"></ion-icon>
                  <input
                    v-model="businessName"
                    type="text"
                    class="form-input"
                    placeholder="Your business name"
                    autocomplete="organization"
                  />
                </div>
              </div>

              <div class="input-group">
                <label class="input-label">Phone Number (Optional)</label>
                <div class="input-wrapper">
                  <ion-icon :icon="callOutline" class="input-icon"></ion-icon>
                  <input
                    v-model="phoneNumber"
                    type="tel"
                    class="form-input"
                    placeholder="Your phone number"
                    autocomplete="tel"
                  />
                </div>
              </div>

              <div v-if="errorMessage" class="error-message">
                <ion-icon :icon="alertCircleOutline"></ion-icon>
                <span>{{ errorMessage }}</span>
              </div>

              <button
                type="submit"
                class="register-btn"
                :disabled="isLoading || !isFormValid"
              >
                <ion-spinner v-if="isLoading" name="crescent" color="light"></ion-spinner>
                <span v-else>Create Account</span>
              </button>
            </form>

            <div class="form-footer">
              <div class="login-link">
                Already have an account?
                <NuxtLink to="/login" class="link">Sign In</NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="register-footer">
          <p>&copy; 2024 CaterHub. All rights reserved.</p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonContent,
  IonIcon,
  IonSpinner,
} from '@ionic/vue';
import {
  eyeOutline,
  eyeOffOutline,
  alertCircleOutline,
  restaurantOutline,
  lockClosedOutline,
  mailOutline,
  businessOutline,
  callOutline,
  checkmarkCircleOutline,
  arrowBackOutline,
} from 'ionicons/icons';

definePageMeta({
  layout: 'auth',
});

const { registerWithEmail, isAuthenticated, userRole } = useAuth();

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const businessName = ref('');
const phoneNumber = ref('');
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');
const registrationSuccess = ref(false);
const registeredEmail = ref('');

const isFormValid = computed(() => {
  return email.value &&
         password.value &&
         password.value.length >= 6 &&
         confirmPassword.value &&
         password.value === confirmPassword.value;
});

const handleRegister = async () => {
  // Validate form
  if (!email.value) {
    errorMessage.value = 'Please enter your email address';
    return;
  }
  if (!password.value || password.value.length < 6) {
    errorMessage.value = 'Password must be at least 6 characters';
    return;
  }
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  const result = await registerWithEmail(
    email.value,
    password.value,
    businessName.value,
    phoneNumber.value
  );

  if (result.success) {
    registeredEmail.value = email.value;
    registrationSuccess.value = true;
  } else {
    errorMessage.value = result.error || 'Registration failed';
  }

  isLoading.value = false;
};

// Redirect if already logged in
onMounted(async () => {
  if (process.client) {
    await new Promise(resolve => setTimeout(resolve, 500));

    if (isAuthenticated.value) {
      if (userRole.value === 'admin') {
        await navigateTo('/admin');
      } else {
        await navigateTo('/');
      }
    }
  }
});
</script>

<style scoped>
.register-page {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.register-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
}

.register-card {
  width: 100%;
  max-width: 450px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

/* Logo Section */
.logo-section {
  text-align: center;
  padding: 30px 30px 20px 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.app-logo {
  width: 70px;
  height: 70px;
  margin: 0 auto 12px auto;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.logo-icon {
  font-size: 36px;
  color: white;
}

.app-name {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 6px 0;
  letter-spacing: -0.5px;
}

.app-tagline {
  font-size: 13px;
  margin: 0;
  opacity: 0.9;
  font-weight: 300;
}

/* Form Container */
.form-container {
  padding: 30px;
}

.form-title {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.form-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0 0 24px 0;
}

.register-form {
  margin-bottom: 20px;
}

.input-group {
  margin-bottom: 16px;
}

.input-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  font-size: 18px;
  color: #999;
  z-index: 1;
}

.form-input {
  width: 100%;
  padding: 12px 14px 12px 44px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 15px;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.password-toggle-icon {
  position: absolute;
  right: 14px;
  font-size: 18px;
  color: #999;
  cursor: pointer;
  transition: color 0.2s;
}

.password-toggle-icon:hover {
  color: #667eea;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  color: #c33;
  font-size: 14px;
  margin-bottom: 16px;
}

.error-message ion-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.register-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.register-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.register-btn:active:not(:disabled) {
  transform: translateY(0);
}

.register-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-footer {
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
  text-align: center;
}

.login-link {
  font-size: 14px;
  color: #666;
}

.link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
}

.link:hover {
  color: #764ba2;
  text-decoration: underline;
}

/* Success Container */
.success-container {
  text-align: center;
  padding: 20px 0;
}

.success-icon-wrapper {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px auto;
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-icon {
  font-size: 48px;
  color: white;
}

.success-title {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 16px 0;
}

.success-message {
  font-size: 15px;
  color: #555;
  line-height: 1.6;
  margin: 0 0 12px 0;
}

.success-note {
  font-size: 13px;
  color: #888;
  margin: 0 0 24px 0;
}

.back-to-login-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.back-to-login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.register-footer {
  margin-top: 24px;
  text-align: center;
  color: white;
  font-size: 13px;
  opacity: 0.8;
}

.register-footer p {
  margin: 0;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .register-container {
    padding: 16px;
  }

  .register-card {
    max-width: 100%;
  }

  .logo-section {
    padding: 24px 20px 16px 20px;
  }

  .app-logo {
    width: 60px;
    height: 60px;
  }

  .logo-icon {
    font-size: 32px;
  }

  .app-name {
    font-size: 24px;
  }

  .app-tagline {
    font-size: 12px;
  }

  .form-container {
    padding: 24px 20px;
  }

  .form-title {
    font-size: 22px;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .register-card {
    background: #1a1a1a;
  }

  .form-title,
  .success-title {
    color: #ffffff;
  }

  .form-subtitle {
    color: #999;
  }

  .input-label {
    color: #ccc;
  }

  .form-input {
    background: #2a2a2a;
    border-color: #444;
    color: white;
  }

  .form-input:focus {
    background: #333;
  }

  .form-footer {
    border-top-color: #444;
  }

  .login-link {
    color: #999;
  }

  .success-message {
    color: #bbb;
  }

  .success-note {
    color: #888;
  }
}
</style>
