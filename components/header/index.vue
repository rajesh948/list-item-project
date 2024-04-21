<template>
  <v-card
    style="z-index: 1"
    max-width="448"
    class="mx-auto mb-16"
    color="grey-lighten-3"
  >
    <v-layout>
      <v-app-bar
        color="teal-darken-4"
        image="https://picsum.photos/1920/1080?random"
      >
        <template v-slot:image>
          <v-img
            gradient="to top right, rgba(19,84,122,.8), rgba(245,226,106,.8)"
          ></v-img>
        </template>

        <template v-slot:prepend>
          <v-app-bar-nav-icon @click="toggleLeftSlider"></v-app-bar-nav-icon>
        </template>

        <v-app-bar-title></v-app-bar-title>

        <v-spacer></v-spacer>

        <v-btn icon @click="onGoto('/decoration-table')">
          <v-icon>mdi-silverware-fork-knife</v-icon>
        </v-btn>
        <v-btn icon @click="onGoto('/item-report')">
          <v-icon>mdi-file-document</v-icon>
        </v-btn>

        <v-btn icon @click="onGoto('/')">
          <v-icon>mdi-home</v-icon>
        </v-btn>
        <v-btn icon @click="onToggleDialog">
          <v-icon>mdi-database-remove</v-icon>
        </v-btn>
      </v-app-bar>
      <v-navigation-drawer v-model="isShowLeftSlider" temporary>
        <!-- <v-list-item
          prepend-avatar="https://randomuser.me/api/portraits/men/78.jpg"
          title="John Leider"
        ></v-list-item> -->

        <!-- <v-divider></v-divider> -->

        <v-list density="compact" nav>
          <v-list-item
          v-for="category in data"
            :key="category.id"
            prepend-icon="mdi-view-dashboard"
            :title="category.name"
            :value="category.name"
            @click="onSelectCategory(category.id)"
            :active="selectedCategoryId == category.id"
          ></v-list-item>
        </v-list>
      </v-navigation-drawer>
    </v-layout>
  </v-card>
  <Dialog :display="isShowDialog">
    <div>
      <v-card-title class="text-h5">Hello ! </v-card-title>
      <v-card-text>Are You Sure To Reset Selected Items.</v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="green-darken-1"
          variant="text"
          @click="resetDataBase(true)"
        >
          Yes
        </v-btn>
        <v-btn
          color="green-darken-1"
          variant="text"
          @click="resetDataBase(false)"
        >
          No
        </v-btn>
      </v-card-actions>
    </div>
  </Dialog>
</template>
<script>
export default {
  setup() {
    const isShowLeftSlider = ref(false);
    const isShowDialog = ref(false);
    const { data } = useData();
const route = useRoute()
const selectedCategoryId = computed(()=>route.params?.id)
    const toggleLeftSlider = () => {
      isShowLeftSlider.value = !isShowLeftSlider.value;
    };

    const onSelectCategory = (categoryId) => {
      navigateTo(`/list-item/${categoryId}`);
      toggleLeftSlider();
    };

    const resetDataBase = (isResent) => {
      if (isResent) {
        localStorage.clear();
        onGoto("/");
      }
      onToggleDialog();
    };

    const onToggleDialog = () => {
      isShowDialog.value = !isShowDialog.value;
    };
    const onGoto = (path) => navigateTo(path);

    return {
      isShowLeftSlider,
      toggleLeftSlider,
      data,
      onSelectCategory,
      onGoto,
      onToggleDialog,
      isShowDialog,
      resetDataBase,
      selectedCategoryId 
    };
  },
};
</script>
<style>
.v-list-item-title{
  font-weight:bold !important;
  font-size:medium !important;
  padding: 10px;
}
</style>
