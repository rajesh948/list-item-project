<template>
  <v-sheet border class="mx-auto my-10" max-width="450">
    <v-card
      variant="tonal"
      color="light-green-darken-2"
      class="ma-5 pa-3"
      v-for="category in data"
      :key="category.id"
    >
      <v-list-item @click="onSelectCategory(category.id)">
        <template v-slot:prepend v-if="category.image">
          <v-avatar class="me-4 mt-2" rounded="0">
            <v-img :src="category.image" cover></v-img>
          </v-avatar>
        </template>

        <h2 class="display-2 font-weight-bold">{{ category.name }}</h2>
      </v-list-item>
    </v-card>
  </v-sheet>
</template>

<script>
export default {
  setup() {
    const { data } = useData();
    const onSelectCategory = (categoryId) => {
      navigateTo(`/list-item/${categoryId}`);
    };
    return { data, onSelectCategory };
  },
};
</script>
