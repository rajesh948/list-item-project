<template>
  <v-card :color="setColor" class="ma-5" theme="dark">
    <div class="d-flex flex-no-wrap justify-space-around">
      <v-avatar class="ma-1" size="125" rounded="0">
        <v-img :src="item.image" />
      </v-avatar>

      <div>
        <v-card-title class="text-h5"> {{ item.name }} </v-card-title>

        <v-card-subtitle>{{ categoryName }}</v-card-subtitle>
        <v-card-actions>
          <!-- <v-avatar v-if="selected">
            <v-chip
              color="green"
              prepend-icon="mdi-checkbox-marked-circle-plus-outline"
            />
          </v-avatar> -->
          <v-btn
            class="ms-2"
            variant="outlined"
            size="small"
            @click="$emit('addItem', item)"
          >
            {{ selected ? "Remove" : "Add" }}
          </v-btn>
        </v-card-actions>
      </div>
    </div>
  </v-card>
</template>
<script>
export default {
  emits: ["addItem"],
  props: {
    categoryName: {
      type: String,
      required: true,
    },
    item: {
      type: Object,
      required: true,
    },
    selected: {
      type: Boolean,
      required: true,
    },
  },
  setup(props) {
    const setColor = computed(() =>
      props.selected ? "green-lighten-3" : "lime-lighten-5"
    );
    return { setColor };
  },
};
</script>
<style scoped>
img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
