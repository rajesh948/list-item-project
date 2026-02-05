<template>
  <ion-page>
    <ion-content class="forgot-page">
      <div class="forgot-container">
        <div class="forgot-card">
          <!-- Logo Section -->
          <div class="logo-section">
            <div class="app-logo">
              <ion-icon :icon="restaurantOutline" class="logo-icon"></ion-icon>
            </div>
            <h1 class="app-name">CaterHub</h1>
            <p class="app-tagline">Professional Catering Management Platform</p>
          </div>

          <!-- Success Message -->
          <div v-if="resetSuccess" class="form-container">
            <div class="success-container">
              <div class="success-icon-wrapper">
                <ion-icon :icon="mailOutline" class="success-icon"></ion-icon>
              </div>
              <h2 class="success-title">Check Your Email</h2>
              <p class="success-message">
                We've sent a password reset link to <strong>{{ sentToEmail }}</strong>.
                Click the link in the email to reset your password.
              </p>
              <p class="success-note">
                Don't see the email? Check your spam folder or wait a few minutes.
              </p>
              <div class="action-buttons">
                <button @click="resetForm" class="action-btn secondary">
                  <ion-icon :icon="refreshOutline"></ion-icon>
                  Try Another Email
                </button>
                <NuxtLink to="/login" class="action-btn">
                  <ion-icon :icon="arrowBackOutline"></ion-icon>
                  Back to Login
                </NuxtLink>
              </div>
            </div>
          </div>

          <!-- Reset Password Form -->
          <div v-else class="form-container">
            <h2 class="form-title">Forgot Password?</h2>
            <p class="form-subtitle">Enter your email to reset your password</p>

            <form @submit.prevent="handleReset" class="reset-form">
              <div class="input-group">
                <label class="input-label">Email or Username</label>
                <div class="input-wrapper">
                  <ion-icon :icon="mailOutline" class="input-icon"></ion-icon>
                  <input
                    v-model="email"
                    type="text"
                    class="form-input"
                    placeholder="Enter your email or username"
                    required
                    autocomplete="email"
                  />
                </div>
                <p class="input-hint">
                  For username accounts, we'll send to your registered email.
                </p>
              </div>

              <div v-if="errorMessage" class="error-message">
                <ion-icon :icon="alertCircleOutline"></ion-icon>
                <span>{{ errorMessage }}</span>
              </div>

              <button
                type="submit"
                class="reset-btn"
                :disabled="isLoading || !email"
              >
                <ion-spinner v-if="isLoading" name="crescent" color="light"></ion-spinner>
                <span v-else>Send Reset Link</span>
              </button>
            </form>

            <div class="form-footer">
              <div class="login-link">
                Remember your password?
                <NuxtLink to="/login" class="link">Sign In</NuxtLink>
              </div>
              <div class="register-link">
                Don't have an account?
                <NuxtLink to="/register" class="link">Create Account</NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="forgot-footer">
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
  alertCircleOutline,
  restaurantOutline,
  mailOutline,
  arrowBackOutline,
  refreshOutline,
} from 'ionicons/icons';

definePageMeta({
  layout: 'auth',
});

const { requestPasswordReset, isAuthenticated, userRole } = useAuth();

const email = ref('');
const isLoading = ref(false);
const errorMessage = ref('');
const resetSuccess = ref(false);
const sentToEmail = ref('');

const handleReset = async () => {
  if (!email.value) {
    errorMessage.value = 'Please enter your email or username';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  const result = await requestPasswordReset(email.value);

  if (result.success) {
    sentToEmail.value = email.value.includes('@') ? email.value : `${email.value}@caterhub.app`;
    resetSuccess.value = true;
  } else {
    errorMessage.value = result.error || 'Failed to send reset email';
  }

  isLoading.value = false;
};

const resetForm = () => {
  email.value = '';
  resetSuccess.value = false;
  errorMessage.value = '';
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
.forgot-page {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.forgot-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
}

.forgot-card {
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
  margin: 0 0 30px 0;
}

.reset-form {
  margin-bottom: 24px;
}

.input-group {
  margin-bottom: 20px;
}

.input-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
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
  left: 16px;
  font-size: 20px;
  color: #999;
  z-index: 1;
}

.form-input {
  width: 100%;
  padding: 14px 16px 14px 48px;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
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

.input-hint {
  font-size: 12px;
  color: #888;
  margin: 8px 0 0 0;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  color: #c33;
  font-size: 14px;
  margin-bottom: 20px;
}

.error-message ion-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.reset-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.reset-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.reset-btn:active:not(:disabled) {
  transform: translateY(0);
}

.reset-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-footer {
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
  text-align: center;
}

.login-link,
.register-link {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.register-link {
  margin-bottom: 0;
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
}

.success-icon-wrapper {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px auto;
  background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
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

.forgot-footer {
  margin-top: 30px;
  text-align: center;
  color: white;
  font-size: 13px;
  opacity: 0.8;
}

.forgot-footer p {
  margin: 0;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .forgot-container {
    padding: 16px;
  }

  .forgot-card {
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
    padding: 30px 20px;
  }

  .form-title,
  .success-title {
    font-size: 22px;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .forgot-card {
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

  .login-link,
  .register-link {
    color: #999;
  }

  .success-message {
    color: #bbb;
  }

  .success-note,
  .input-hint {
    color: #888;
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
