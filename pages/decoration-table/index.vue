<template>
  <div>
    <v-container fluid v-if="decorationTable.length">
      <Slider
        @addItem="onAddItem"
        v-for="item in decorationTable"
        :key="item.id"
        :decorationItem="item"
        :selected="isItemSelected(item.id)"
      />
    </v-container>
  </div>
</template>
<script>
export default {
  setup() {
    const isShowLeftSlider = ref(false);
    const selectedTableFromStorage = ref(null);
    const toggleLeftSlider = () => {
      isShowLeftSlider.value = !isShowLeftSlider.value;
    };
    const { decorationTable } = useData();

    const onAddItem = (itemData) => {
      const selectedTable =
        JSON.parse(localStorage.getItem("selectedTable")) || {};
   if(selectedTable.id && selectedTable.id === itemData.id){
     localStorage.removeItem("selectedTable");
     selectedTableFromStorage.value = null
     return
   }
      localStorage.setItem("selectedTable", JSON.stringify(itemData));
      selectedTableFromStorage.value = itemData;
    };
    onMounted(() => {
      selectedTableFromStorage.value =
        JSON.parse(localStorage.getItem("selectedTable")) || {};
    });
    const isItemSelected = (itemId) => {
      const selectedData = selectedTableFromStorage.value || {};
      return selectedData?.id === itemId ? true : false;
    };

    return {
      isShowLeftSlider,
      toggleLeftSlider,
      decorationTable,
      onAddItem,
      isItemSelected,
    };
  },
};
</script>
