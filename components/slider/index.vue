<template>
  <v-card :color="setColor" rounded="0" class="ma-5">
    <swiper :pagination="{dynamicBullets: true}"  :modules="modules" class="mySwiper">
      <swiper-slide  v-for="item in decorationItem.images" :key="`card-${item.id}`">  
        <v-img :src="item.image" />
        </swiper-slide>
    </swiper>
    <div class="d-flex justify-center align-center">
      <!-- <v-card-title class="text-h5"> {{ decorationItem.name }} </v-card-title> -->
      <v-card-actions>
        <v-btn
          class="ms-3 px-8"
          variant="outlined"
          size="small"
          @click="$emit('addItem', decorationItem)"
        >
          {{ selected ? "Remove" : "Select" }}
        </v-btn>
      </v-card-actions>
    </div>
  </v-card>
</template>

<script>
import { Pagination } from "swiper/modules";
export default {
  emits: ["addItem"],
  props: {
    decorationItem: {
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
    return {
      modules: [Pagination],
      setColor,
    };
  },
};
</script>

<style scoped>
#app {
  height: 100%;
}
html,
body {
  position: relative;
  height: 100%;
}

body {
  background: #eee;
  font-family: Helvetica Neue, Helvetica, Arial, sans-serif;
  font-size: 14px;
  color: #000;
  margin: 0;
  padding: 0;
}

.swiper {
  width: 100%;
  height: 100%;
}

.swiper-slide {
  text-align: center;
  font-size: 18px;
  background: #fff;

  /* Center slide text vertically */
  display: flex;
  justify-content: center;
  align-items: center;
}

.swiper-slide img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
