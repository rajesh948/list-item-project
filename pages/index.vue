<template>
  <v-card class="mx-auto" max-width="450">
    <v-list lines="three">
      <v-list-item v-for="category in data" :key="category.id" link>
        <template v-slot:prepend>
          <v-avatar class="me-4 mt-2" rounded="0">
            <v-img :src="category?.image" cover></v-img>
          </v-avatar>
        </template>

        <v-sheet class="display-2 font-weight-bold">{{
          category.name
        }}</v-sheet>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script>
export default {
  setup() {
    const { data } = useData();
    return { data };
  },
};
</script>
