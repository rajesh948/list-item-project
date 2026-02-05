<template>
  <div
    class="item-card"
    :class="{ selected }"
    @click="$emit('toggle')"
  >
    <div class="item-image" v-if="item.image">
      <img :src="item.image" :alt="item.name" />
    </div>
    <div class="item-content">
      <p class="item-name">{{ item.name }}</p>
      <p v-if="showCategory && item.categoryName" class="item-category">
        {{ item.categoryName }}
      </p>
    </div>
    <div class="check-icon">
      <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonIcon } from '@ionic/vue';
import { checkmarkCircleOutline } from 'ionicons/icons';

defineProps<{
  item: {
    id: string;
    name: string;
    image?: string;
    categoryName?: string;
  };
  selected: boolean;
  showCategory?: boolean;
}>();

defineEmits<{
  toggle: [];
}>();
</script>

<style scoped>
.item-card {
  display: flex;
  flex-direction: column;
  background: white;
  border: 2px solid #e8e8e8;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.item-card:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.item-card.selected {
  border-color: #4CAF50;
  background: linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(76, 175, 80, 0.1) 100%);
}

.item-image {
  width: 100%;
  height: 80px;
  overflow: hidden;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-content {
  padding: 10px;
  flex: 1;
}

.item-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-category {
  font-size: 0.7rem;
  color: #888;
  margin: 4px 0 0 0;
}

.check-icon {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.2s;
}

.item-card.selected .check-icon {
  opacity: 1;
  transform: scale(1);
}

.check-icon ion-icon {
  font-size: 20px;
  color: #4CAF50;
}

@media (max-width: 480px) {
  .item-image {
    height: 60px;
  }

  .item-content {
    padding: 8px;
  }

  .item-name {
    font-size: 0.8rem;
  }
}
</style>
