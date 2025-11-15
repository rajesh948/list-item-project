<template>
  <ion-card :class="{ 'card-selected': selected }" class="decoration-card">
    <swiper
      :pagination="{ dynamicBullets: true }"
      :modules="modules"
      class="decoration-swiper"
    >
      <swiper-slide
        v-for="item in decorationItem.images"
        :key="`card-${item.id}`"
      >
        <ion-img :src="item.image" :alt="decorationItem.name"></ion-img>
      </swiper-slide>
    </swiper>
    <ion-card-content class="decoration-actions">
      <ion-button
        expand="block"
        :color="selected ? 'danger' : 'primary'"
        @click="$emit('addItem', decorationItem)"
      >
        {{ selected ? "Remove" : "Select" }}
      </ion-button>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import { IonCard, IonCardContent, IonButton, IonImg } from '@ionic/vue';
import { Pagination } from 'swiper/modules';

interface DecorationImage {
  id: string;
  image: string;
}

interface DecorationItem {
  id: string;
  name: string;
  images: DecorationImage[];
}

defineProps<{
  decorationItem: DecorationItem;
  selected: boolean;
}>();

defineEmits<{
  addItem: [item: DecorationItem];
}>();

const modules = [Pagination];
</script>

<style scoped>
.decoration-card {
  margin: 20px;
  transition: all 0.3s ease;
}

.card-selected {
  border: 2px solid var(--ion-color-success);
  background-color: var(--ion-color-success-tint);
}

.decoration-swiper {
  width: 100%;
  height: 300px;
}

.swiper-slide {
  text-align: center;
  font-size: 18px;
  background: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
}

.swiper-slide ion-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.decoration-actions {
  padding: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
