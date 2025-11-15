<template>
  <ion-card
    :class="{ 'card-selected': selected }"
    class="item-card"
    @click="$emit('addItem', item)"
    button
  >
    <ion-card-content class="card-content">
      <div class="card-layout">
        <ion-thumbnail v-if="item.image" class="item-thumbnail">
          <ion-img :src="item.image" :alt="item.name"></ion-img>
        </ion-thumbnail>

        <div class="item-info">
          <ion-card-title class="item-name">{{ item.name }}</ion-card-title>
          <ion-badge v-if="showCategoryBadge" color="primary" class="category-badge">
            {{ categoryName }}
          </ion-badge>
        </div>
      </div>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import {
  IonCard,
  IonCardContent,
  IonCardTitle,
  IonButton,
  IonThumbnail,
  IonImg,
  IonBadge,
} from '@ionic/vue';

interface Item {
  id: string;
  name: string;
  image?: string;
}

defineProps<{
  categoryName: string;
  item: Item;
  selected: boolean;
  showCategoryBadge?: boolean; // Show category badge during global search
}>();

defineEmits<{
  addItem: [item: Item];
}>();
</script>

<style scoped>
.item-card {
  margin: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.item-card:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.card-selected {
  border: 3px solid var(--ion-color-success);
  background-color: var(--ion-color-success-tint);
}

.card-content {
  padding: 8px;
}

.card-layout {
  display: flex;
  align-items: center;
  gap: 12px;
}

.item-thumbnail {
  width: 125px;
  height: 125px;
  flex-shrink: 0;
}

.item-thumbnail ion-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  min-height: 25px;
}

.item-name {
  font-size: 1.1rem;
  font-weight: bold;
  margin: 0;
  padding-left: 30px;
}

.category-badge {
  margin-top: 6px;
  margin-left: 30px;
  font-size: 0.75rem;
  padding: 4px 8px;
}
</style>
