<template>
  <div>
    <v-container fluid v-if="selectedCategoryData">
      <Card
        @addItem="onAddItem"
        v-for="item in selectedCategoryData.items"
        :key="item.id"
        :item="item"
        :selected="isItemSelected(item.id)"
        :categoryName="selectedCategoryData.name"
      />
    </v-container>
  </div>
</template>
<script>
export default {
  setup() {
    const isShowLeftSlider = ref(false);
    const route = useRoute();
    const selectedDataFromStorage = ref(null);
    const toggleLeftSlider = () => {
      isShowLeftSlider.value = !isShowLeftSlider.value;
    };
    const { data } = useData();
    const selectedCategoryData = computed(() =>
      data.find((category) => category.id === +route.params.id)
    );
    const onAddItem = (itemData) => {
      const selectedData =
        JSON.parse(localStorage.getItem("selectedData")) || [];
      const categoryIndex = selectedData.findIndex(
        (item) => item.id === selectedCategoryData.value.id
      );
      if (categoryIndex != -1) {
        const itemIndex = selectedData[categoryIndex].items.findIndex(
          (item) => item.id === itemData.id
        );
        if (itemIndex === -1) {
          selectedData[categoryIndex].items.push(itemData);
        } else {
          if (selectedData[categoryIndex].items.length === 1) {
            selectedData.splice(categoryIndex, 1);
          } else {
            selectedData[categoryIndex].items.splice(itemIndex, 1);
          }
        }
      } else {
        selectedData.push({
          id: selectedCategoryData.value.id,
          name: selectedCategoryData.value.name,
          items: [itemData],
        });
      }
      localStorage.setItem("selectedData", JSON.stringify(selectedData));
      selectedDataFromStorage.value = selectedData;
    };
    onMounted(() => {
      selectedDataFromStorage.value =
        JSON.parse(localStorage.getItem("selectedData")) || [];
    });
    const isItemSelected = (itemId) => {
      const selectedData = selectedDataFromStorage.value || [];
      const index = selectedData.findIndex(
        (item) => item.id === selectedCategoryData.value.id
      );
      if (index != -1) {
        const itemIndex = selectedData[index].items.findIndex(
          (item) => item.id === itemId
        );
        if (itemIndex != -1) {
          return true;
        }
      }
      return false;
    };

    return {
      isShowLeftSlider,
      toggleLeftSlider,
      selectedCategoryData,
      onAddItem,
      isItemSelected,
    };
  },
};
</script>
