<template>
  <v-card
    style="z-index: 1"
    max-width="448"
    class="mx-auto mb-10"
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

        <v-btn icon @click="onGoto('/item-report')">
          <v-icon>mdi-file-document</v-icon>
        </v-btn>

        <v-btn icon @click="onGoto('/')">
          <v-icon>mdi-home</v-icon>
        </v-btn>
        <v-btn icon @click="clearLocalStorage">
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
          ></v-list-item>
        </v-list>
      </v-navigation-drawer>
    </v-layout>
  </v-card>
</template>
<script>
export default {
  setup() {
    const isShowLeftSlider = ref(false);
    const toggleLeftSlider = () => {
      isShowLeftSlider.value = !isShowLeftSlider.value;
    };
    const { data } = useData();
    const onSelectCategory = (categoryId) => {
      navigateTo(`/list-item/${categoryId}`);
      toggleLeftSlider();
    };
    const clearLocalStorage = () => {
      localStorage.clear();
      onGoto("/");
    };
    const onGoto = (path) => navigateTo(path);
    return {
      isShowLeftSlider,
      toggleLeftSlider,
      data,
      onSelectCategory,
      onGoto,
      clearLocalStorage,
    };
  },
};
</script>
