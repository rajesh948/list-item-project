<template>
  <ion-page>
    <ion-content class="ion-padding">
      <div v-if="decorationTable.length" class="decorations-container">
        <Slider
          @addItem="onAddItem"
          v-for="item in decorationTable"
          :key="item.id"
          :decorationItem="item"
          :selected="isItemSelected(item.id)"
        />
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue';

const selectedTableFromStorage = ref<any>(null);
const { decorationTable } = useData();

const onAddItem = (itemData: any) => {
  const selectedTable =
    JSON.parse(localStorage.getItem('selectedTable') || '{}');

  if (selectedTable.id && selectedTable.id === itemData.id) {
    localStorage.removeItem('selectedTable');
    selectedTableFromStorage.value = null;
    return;
  }

  localStorage.setItem('selectedTable', JSON.stringify(itemData));
  selectedTableFromStorage.value = itemData;
};

onMounted(() => {
  selectedTableFromStorage.value =
    JSON.parse(localStorage.getItem('selectedTable') || '{}');
});

const isItemSelected = (itemId: string) => {
  const selectedData = selectedTableFromStorage.value || {};
  return selectedData?.id === itemId ? true : false;
};
</script>

<style scoped>
.decorations-container {
  max-width: 800px;
  margin: 0 auto;
}
</style>
