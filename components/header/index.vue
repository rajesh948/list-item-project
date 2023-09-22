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

        <v-btn icon @click="onToggleDialog(`userForm`)">
          <v-icon>mdi-file-document</v-icon>
        </v-btn>

        <v-btn icon @click="onGoto('/')">
          <v-icon>mdi-home</v-icon>
        </v-btn>
        <v-btn icon @click="onToggleDialog(`alertBox`)">
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
  <Dialog :display="isShowDialog">
    <div v-if="dialogTitle === 'alertBox'">
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
    <div v-if="dialogTitle === 'userForm'">
      <v-card-title>
        <span class="text-h5">User Profile</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field
                variant="underlined"
                label="Enter name*"
                v-model="userData.name"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                variant="underlined"
                label="Phone Number*"
                v-model="userData.phone"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                variant="underlined"
                label="Number of People*"
                v-model="userData.noOfPeople"
                required
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field
                variant="underlined"
                label="date*"
                v-model="userData.date"
                type="date"
                required
              ></v-text-field>
            </v-col>
          </v-row>

          <v-chip
            v-if="errorMessage"
            class="ma-2 px-10"
            color="red"
            label
            text-color="white"
          >
            *{{ errorMessage }}
          </v-chip>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="blue-darken-1"
          variant="text"
          @click="resetDataBase(false)"
        >
          Close
        </v-btn>
        <v-btn color="blue-darken-1" variant="text" @click="onAddUser">
          Save
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
    const errorMessage = ref(null);
    const userData = ref({
      name: null,
      phone: null,
      noOfPeople: null,
      date: null,
    });
    onMounted(() => {
      if (JSON.parse(localStorage.getItem("userData"))) {
        userData.value = JSON.parse(localStorage.getItem("userData"));
      }
    });
    const dialogTitle = ref(null);
    const toggleLeftSlider = () => {
      isShowLeftSlider.value = !isShowLeftSlider.value;
    };
    const { data } = useData();
    const onSelectCategory = (categoryId) => {
      navigateTo(`/list-item/${categoryId}`);
      toggleLeftSlider();
    };
    const resetDataBase = (isResent) => {
      if (isResent) {
        localStorage.clear();
        onGoto("/");
      }
      onToggleDialog(null);
    };

    const onToggleDialog = (name) => {
      errorMessage.value = null;
      dialogTitle.value = name;
      isShowDialog.value = !isShowDialog.value;
    };
    const onGoto = (path) => navigateTo(path);
    const onAddUser = () => {
      if (!Object.values(userData.value).every((value) => value)) {
        return (errorMessage.value = "Please Fill All Field !");
      }
      localStorage.setItem("userData", JSON.stringify(userData.value));
      onGoto("/item-report");
      onToggleDialog(null);
    };
    return {
      isShowLeftSlider,
      toggleLeftSlider,
      data,
      onSelectCategory,
      onGoto,
      onToggleDialog,
      isShowDialog,
      dialogTitle,
      resetDataBase,
      onAddUser,
      userData,
      errorMessage,
    };
  },
};
</script>
