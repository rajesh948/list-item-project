<template>
  <ion-page>
    <ion-content class="verify-page">
      <div class="verify-container">
        <div class="verify-card">
          <!-- Logo Section -->
          <div class="logo-section">
            <div class="app-logo">
              <ion-icon :icon="restaurantOutline" class="logo-icon"></ion-icon>
            </div>
            <h1 class="app-name">CaterHub</h1>
            <p class="app-tagline">Professional Catering Management Platform</p>
          </div>

          <!-- Loading State -->
          <div v-if="isLoading" class="form-container">
            <div class="loading-container">
              <ion-spinner name="crescent" color="primary"></ion-spinner>
              <p class="loading-text">Verifying your email...</p>
            </div>
          </div>

          <!-- Success State -->
          <div v-else-if="verificationSuccess" class="form-container">
            <div class="result-container">
              <div class="result-icon-wrapper success">
                <ion-icon :icon="checkmarkCircleOutline" class="result-icon"></ion-icon>
              </div>
              <h2 class="result-title">Email Verified!</h2>
              <p class="result-message">
                Your email has been successfully verified. You can now sign in to your account.
              </p>
              <NuxtLink to="/login" class="action-btn">
                <ion-icon :icon="logInOutline"></ion-icon>
                Sign In to Your Account
              </NuxtLink>
            </div>
          </div>

          <!-- Error State -->
          <div v-else-if="errorMessage && !showResendForm" class="form-container">
            <div class="result-container">
              <div class="result-icon-wrapper error">
                <ion-icon :icon="closeCircleOutline" class="result-icon"></ion-icon>
              </div>
              <h2 class="result-title">Verification Failed</h2>
              <p class="result-message">{{ errorMessage }}</p>
              <div class="action-buttons">
                <button class="action-btn secondary" @click="showResendForm = true">
                  <ion-icon :icon="refreshOutline"></ion-icon>
                  Resend Verification Email
                </button>
                <NuxtLink to="/login" class="action-btn">
                  <ion-icon :icon="logInOutline"></ion-icon>
                  Go to Login
                </NuxtLink>
              </div>
            </div>
          </div>

          <!-- Resend Form -->
          <div v-else class="form-container">
            <h2 class="form-title">Resend Verification</h2>
            <p class="form-subtitle">Enter your credentials to resend the verification email</p>

            <form @submit.prevent="handleResend" class="resend-form">
              <div class="input-group">
                <label class="input-label">Email Address</label>
                <div class="input-wrapper">
                  <ion-icon :icon="mailOutline" class="input-icon"></ion-icon>
                  <input
                    v-model="email"
                    type="email"
                    class="form-input"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div class="input-group">
                <label class="input-label">Password</label>
                <div class="input-wrapper">
                  <ion-icon :icon="lockClosedOutline" class="input-icon"></ion-icon>
                  <input
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    class="form-input"
                    placeholder="Enter your password"
                    required
                  />
                  <ion-icon
                    :icon="showPassword ? eyeOffOutline : eyeOutline"
                    @click="showPassword = !showPassword"
                    class="password-toggle-icon"
                  ></ion-icon>
                </div>
              </div>

              <div v-if="resendError" class="error-message">
                <ion-icon :icon="alertCircleOutline"></ion-icon>
                <span>{{ resendError }}</span>
              </div>

              <div v-if="resendSuccess" class="success-message">
                <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
                <span>{{ resendSuccess }}</span>
              </div>

              <button
                type="submit"
                class="resend-btn"
                :disabled="isResending || !email || !password"
              >
                <ion-spinner v-if="isResending" name="crescent" color="light"></ion-spinner>
                <span v-else>Send Verification Email</span>
              </button>
            </form>

            <div class="form-footer">
              <NuxtLink to="/login" class="link">
                <ion-icon :icon="arrowBackOutline"></ion-icon>
                Back to Login
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="verify-footer">
          <p>&copy; 2024 CaterHub. All rights reserved.</p>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { applyActionCode } from 'firebase/auth';
import {
  IonPage,
  IonContent,
  IonIcon,
  IonSpinner,
} from '@ionic/vue';
import {
  restaurantOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  mailOutline,
  logInOutline,
  arrowBackOutline,
  refreshOutline,
  alertCircleOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
} from 'ionicons/icons';

definePageMeta({
  layout: 'auth',
});

const { $auth } = useNuxtApp();
const { resendVerificationWithCredentials } = useAuth();
const route = useRoute();

const isLoading = ref(false);
const verificationSuccess = ref(false);
const errorMessage = ref('');
const showResendForm = ref(false);

// Form fields
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const isResending = ref(false);
const resendError = ref('');
const resendSuccess = ref('');

const handleResend = async () => {
  if (!email.value || !password.value) {
    resendError.value = 'Please enter email and password';
    return;
  }

  isResending.value = true;
  resendError.value = '';
  resendSuccess.value = '';

  const result = await resendVerificationWithCredentials(email.value, password.value);

  if (result.success) {
    resendSuccess.value = result.message || 'Verification email sent! Check your inbox.';
  } else {
    resendError.value = result.error || 'Failed to send email';
  }

  isResending.value = false;
};

onMounted(async () => {
  if (process.client) {
    // Check for oobCode in URL (Firebase action code)
    const oobCode = route.query.oobCode as string;
    const mode = route.query.mode as string;
    const emailParam = route.query.email as string;

    // Pre-fill email if passed from login page
    if (emailParam) {
      email.value = emailParam;
    }

    if (oobCode && mode === 'verifyEmail') {
      isLoading.value = true;

      try {
        await applyActionCode($auth, oobCode);
        verificationSuccess.value = true;
      } catch (error: any) {
        if (error.code === 'auth/invalid-action-code') {
          errorMessage.value = 'This verification link is invalid or has expired.';
        } else if (error.code === 'auth/expired-action-code') {
          errorMessage.value = 'This verification link has expired.';
        } else {
          errorMessage.value = 'Failed to verify email. Please try again.';
        }
      }

      isLoading.value = false;
    } else {
      // No code in URL - show resend form
      showResendForm.value = true;
    }
  }
});
</script>

<style scoped>
.verify-page {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.verify-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
}

.verify-card {
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
  padding: 40px 30px;
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

/* Loading Container */
.loading-container {
  text-align: center;
  padding: 40px 0;
}

.loading-text {
  margin-top: 16px;
  color: #666;
  font-size: 15px;
}

/* Result Container */
.result-container {
  text-align: center;
}

.result-icon-wrapper {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px auto;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.result-icon-wrapper.success {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
}

.result-icon-wrapper.error {
  background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
}

.result-icon {
  font-size: 48px;
  color: white;
}

.result-title {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 16px 0;
}

.result-message {
  font-size: 15px;
  color: #555;
  line-height: 1.6;
  margin: 0 0 24px 0;
}

/* Form Styles */
.resend-form {
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
  background: #ffebee;
  border: 1px solid #f44336;
  border-radius: 8px;
  color: #c62828;
  font-size: 14px;
  margin-bottom: 16px;
}

.success-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  background: #e8f5e9;
  border: 1px solid #4caf50;
  border-radius: 8px;
  color: #2e7d32;
  font-size: 14px;
  margin-bottom: 16px;
}

.error-message ion-icon,
.success-message ion-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.resend-btn {
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

.resend-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.resend-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.action-btn.secondary {
  background: #f5f5f5;
  color: #333;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.action-btn.secondary:hover {
  background: #e8e8e8;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.form-footer {
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
  text-align: center;
}

.link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  transition: color 0.2s;
}

.link:hover {
  color: #764ba2;
}

.verify-footer {
  margin-top: 24px;
  text-align: center;
  color: white;
  font-size: 13px;
  opacity: 0.8;
}

.verify-footer p {
  margin: 0;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .verify-container {
    padding: 16px;
  }

  .verify-card {
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

  .form-container {
    padding: 30px 20px;
  }

  .result-title,
  .form-title {
    font-size: 22px;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .verify-card {
    background: #1a1a1a;
  }

  .result-title,
  .form-title {
    color: #ffffff;
  }

  .form-subtitle {
    color: #999;
  }

  .result-message {
    color: #bbb;
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

  .action-btn.secondary {
    background: #333;
    color: #fff;
  }

  .action-btn.secondary:hover {
    background: #444;
  }
}
</style>
