<template>
  <ion-page>
    <ion-content class="login-page">
      <div class="login-container">
        <div class="login-card">
          <!-- Logo Section -->
          <div class="logo-section">
            <div class="app-logo">
              <ion-icon :icon="restaurantOutline" class="logo-icon"></ion-icon>
            </div>
            <h1 class="app-name">CaterPro</h1>
            <p class="app-tagline">Professional Catering Management Platform</p>
          </div>

          <!-- Login Form -->
          <div class="form-container">
            <h2 class="form-title">Welcome Back</h2>
            <p class="form-subtitle">Sign in to your account</p>

            <form @submit.prevent="handleLogin" class="login-form">
              <div class="input-group">
                <label class="input-label">Username</label>
                <div class="input-wrapper">
                  <ion-icon :icon="personCircleOutline" class="input-icon"></ion-icon>
                  <input
                    v-model="username"
                    type="text"
                    class="form-input"
                    placeholder="Enter your username"
                    required
                    autocomplete="username"
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
                    autocomplete="current-password"
                  />
                  <ion-icon
                    :icon="showPassword ? eyeOffOutline : eyeOutline"
                    @click="showPassword = !showPassword"
                    class="password-toggle-icon"
                  ></ion-icon>
                </div>
              </div>

              <div v-if="errorMessage" class="error-message">
                <ion-icon :icon="alertCircleOutline"></ion-icon>
                <span>{{ errorMessage }}</span>
              </div>

              <button
                type="submit"
                class="login-btn"
                :disabled="isLoading || !username || !password"
              >
                <ion-spinner v-if="isLoading" name="crescent" color="light"></ion-spinner>
                <span v-else>Sign In</span>
              </button>
            </form>

            <div class="form-footer">
              <div class="help-text">
                <ion-icon :icon="informationCircleOutline"></ion-icon>
                <span>Need access? Contact your administrator</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="login-footer">
          <p>&copy; 2024 CaterPro. All rights reserved.</p>
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
  informationCircleOutline,
  restaurantOutline,
  personCircleOutline,
  lockClosedOutline,
} from 'ionicons/icons';

const { login, userRole, isAuthenticated } = useAuth();

const username = ref('');
const password = ref('');
const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');

const handleLogin = async () => {
  if (!username.value || !password.value) {
    errorMessage.value = 'Please enter username and password';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  const result = await login(username.value, password.value);

  if (result.success) {
    // Redirect to the appropriate page with full page reload
    console.log('Login successful, redirecting to:', result.redirectTo);

    // Small delay to ensure Firebase Auth state is saved
    await new Promise(resolve => setTimeout(resolve, 300));

    // Use window.location for full page reload to ensure Firebase Auth initializes properly
    if (process.client) {
      window.location.href = result.redirectTo || '/';
    }
  } else {
    errorMessage.value = result.error || 'Login failed';
    isLoading.value = false;
  }
};

// Redirect if already logged in
onMounted(async () => {
  if (process.client) {
    // Wait a bit for auth to initialize
    await new Promise(resolve => setTimeout(resolve, 500));

    if (isAuthenticated.value) {
      console.log('🔄 Already logged in, redirecting...', userRole.value);

      if (userRole.value === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/';
      }
    }
  }
});
</script>

<style scoped>
.login-page {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
}

.login-card {
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
  padding: 40px 30px 30px 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.app-logo {
  width: 80px;
  height: 80px;
  margin: 0 auto 16px auto;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.logo-icon {
  font-size: 40px;
  color: white;
}

.app-name {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.app-tagline {
  font-size: 14px;
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

.login-form {
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

.password-toggle-icon {
  position: absolute;
  right: 16px;
  font-size: 20px;
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

.login-btn {
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

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.login-btn:active:not(:disabled) {
  transform: translateY(0);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-footer {
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.help-text {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #666;
  justify-content: center;
}

.help-text ion-icon {
  font-size: 16px;
  color: #667eea;
}

.login-footer {
  margin-top: 30px;
  text-align: center;
  color: white;
  font-size: 13px;
  opacity: 0.8;
}

.login-footer p {
  margin: 0;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .login-container {
    padding: 16px;
  }

  .login-card {
    max-width: 100%;
  }

  .logo-section {
    padding: 30px 20px 20px 20px;
  }

  .app-logo {
    width: 70px;
    height: 70px;
  }

  .logo-icon {
    font-size: 36px;
  }

  .app-name {
    font-size: 28px;
  }

  .app-tagline {
    font-size: 13px;
  }

  .form-container {
    padding: 30px 20px;
  }

  .form-title {
    font-size: 22px;
  }
}

/* Dark mode support (optional) */
@media (prefers-color-scheme: dark) {
  .login-card {
    background: #1a1a1a;
  }

  .form-title {
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
}
</style>
