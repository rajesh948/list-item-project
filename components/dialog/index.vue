<template>
  <v-row justify="center">
    <v-dialog v-model="isDisplay" persistent width="auto">
      <v-card>
        <slot></slot>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
export default {
  props: {
    display: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const isDisplay = computed(() => props.display);
    return { isDisplay };
  },
};
</script>
