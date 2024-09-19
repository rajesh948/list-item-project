<template>
  <div class="mt-5" v-if="selectedDataFromStorage?.length">
    <v-sheet border id="pdfSection">
      <v-container>
        <v-sheet border class="pa-2 mb-3 border-opacity-50 text-sm-h6 font-weight-medium ">
          <div class="px-sm-10">
            <div class="text-center mb-1">
              <div class="text-h4 font-weight-bold">મહાકાળી કેટરર્સ</div>
              <div class="font-weight-bold">Phone No: 97274 73918 , 98253 52718</div>
            </div>
            <v-row>
              <v-col class="pa-0" cols="8"><span class="font-weight-bold">Name: </span> {{ userData.name }} </v-col>
              <v-col class="pa-0" cols="4"><span class="font-weight-bold">Date: </span>{{ userData.date }} </v-col>
              <v-col class="pa-0" cols="8"><span class="font-weight-bold">Address: </span>{{ userData.address }}</v-col>
              <v-col class="pa-0" cols="4"><span class="font-weight-bold">People No: </span>{{ userData.noOfPeople
              }}</v-col>
              <v-col class="pa-0" cols="4"><span class="font-weight-bold">Phone: </span>{{ userData.phone }} </v-col>
              <v-col class="pa-0" cols="4"><span class="font-weight-bold">Shift: </span>{{ userData.shift }} </v-col>
              <v-col class="pa-0" cols="4"><span class="font-weight-bold">Price: </span>{{ userData.price }}</v-col>
            </v-row>
          </div>
        </v-sheet>
        <div v-if="selectedTableFromStorage">
          <h4>Dish Table Decoration</h4>
          <v-row align="center" no-gutters>
            <v-sheet>
              <v-chip :closable="isChipClosable" @click:close="removeTable" class="ma-1 text-subtitle-1" label>
                {{ selectedTableFromStorage.name }}
              </v-chip>
            </v-sheet>
          </v-row>
          <v-divider class="border-opacity-50 my-2" :thickness="1"></v-divider>
        </div>
        <div v-for="category in selectedDataFromStorage" :key="category.name">
          <v-chip class="ma-2" color="success" variant="outlined">
            <!-- <v-icon icon="mdi-arrow-right-bold" start></v-icon> -->
            <h4>{{ category.name }}</h4>
          </v-chip>
          <v-row align="center" no-gutters>
            <v-col class="display-fex-row-only" :cols="isChipClosable ? 11 : 12">
              <v-sheet v-for="item in category.items" :key="item.name">
                <v-chip :closable="isChipClosable" @click:close="removeItem(item.id, category.id)"
                  class="ma-1 text-subtitle-1 font-weight-bold" label>
                  {{ item.name }}
                </v-chip>
              </v-sheet>
            </v-col>
            <v-col v-if="isChipClosable" cols="1">
              <v-btn color="green-darken-1" icon @click="editCategoryItems(category)">
                <v-icon>mdi-square-edit-outline</v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <v-divider class="border-opacity-50 my-2" :thickness="1"></v-divider>
        </div>
      </v-container>
    </v-sheet>
    <div class="text-center my-3">
      <v-btn class="pa-3 ma-3" variant="tonal" color="blue" append-icon="mdi-file-edit-outline" size="extra-large"
        @click="onToggleDialog">EDIT</v-btn>
      <v-btn class="pa-3 ma-3" color="green" variant="tonal" append-icon="mdi-file-download-outline" size="extra-large"
        @click="getPDF">PDF</v-btn>
      <v-btn class="pa-3 ma-3" color="green" variant="tonal" append-icon="mdi-file-download-outline" size="extra-large"
        @click="toggleAddItemDialog">Add New Item</v-btn>
    </div>
  </div>
  <v-chip @click="onGotoHome" v-else class="d-flex justify-center text-h4 my-16 pa-16 font-weight-black" variant="plain">
    Please Add Items
  </v-chip>
  <Dialog :display="isShowDialog">
    <div>
      <v-card-title>
        <span class="text-h5">User Profile</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-text-field variant="underlined" label="Enter name*" v-model="userFormData.name" required></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field variant="underlined" label="Phone Number*" v-model="userFormData.phone" type="number"
                required></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field variant="underlined" label="Number of People*" v-model="userFormData.noOfPeople" type="number"
                required></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field variant="underlined" label="date*" v-model="userFormData.date" type="date"
                required></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field variant="underlined" label="Address*" v-model="userFormData.address" required></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-text-field variant="underlined" label="Price*" v-model="userFormData.price" type="number"
                required></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-select variant="underlined" label="Select Shift*" :items="['Morning', 'Afternoon', 'Night']"
                v-model="userFormData.shift" required></v-select>
            </v-col>
          </v-row>

          <v-chip v-if="errorMessage" class="ma-2 px-10" color="red" label text-color="white">
            *{{ errorMessage }}
          </v-chip>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="blue-darken-1" variant="text" @click="onToggleDialog">
          Close
        </v-btn>
        <v-btn color="blue-darken-1" variant="text" @click="onAddUser">
          Save
        </v-btn>

      </v-card-actions>
    </div>
  </Dialog>
  <v-dialog persistent width="auto" v-model="isLoading">
    <v-progress-circular color="green" indeterminate :size="76" :width="6"></v-progress-circular>
  </v-dialog>
  <Dialog :display="isShowAddItemDialog">
    <div class="new-item-form-container">
      <v-card-title>
        <span class="text-h5">Add New Item</span>
      </v-card-title>
      <v-card-text>
        <v-container>
          <v-row>
            <v-col v-for="(category, mainIdex) of newItemFormData" :key="category.id" cols="12">

              <div class="display-fex-row">
                <span>{{ mainIdex + 1 }}</span>
                <v-text-field :disabled="isEditMode" variant="underlined" label="Enter main category name"
                  v-model="category.name" required></v-text-field>
              </div>
              <v-row class="sub-category-wrap">
                <v-col v-if="category?.items?.length" cols="8">
                  <v-row class="display-fex-row" v-for="(subItem, index) of category.items" :key="subItem.id">
                    <span>{{ index + 1 }}</span>
                    <v-text-field variant="underlined" :disabled="subItem?.disable" label="Enter sub item name"
                      v-model="subItem.name" required></v-text-field>
                  </v-row>
                </v-col>
                <v-col class="display-flex" cols="4">
                  <v-btn color="green-darken-1" append-icon="mdi-plus-circle" variant="tonal"
                    @click="onAddNewItem('subItem', category.items)">
                    sub
                  </v-btn>
                </v-col>
              </v-row>
            </v-col>
            <v-btn v-if="!isEditMode" color="green-darken-1" append-icon="mdi-plus-circle" variant="tonal"
              @click="onAddNewItem('category')">
              item
            </v-btn>
          </v-row>
        </v-container>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="green-darken-1" variant="text" @click="toggleAddItemDialog">
          cancel
        </v-btn>
        <v-btn color="green-darken-1" variant="text" @click="onSaveData">
          Save
        </v-btn>
      </v-card-actions>
    </div>
  </Dialog>
</template>
<script>
import { uuid } from 'vue-uuid';

export default {
  setup() {
    const NAMESPACE = "65f9af5d-f23f-4065-ac85-da725569fdcd";
    const errorMessage = ref(null);
    const isLoading = ref(false);
    const isShowAddItemDialog = ref(false);
    const selectedDataFromStorage = ref(null);
    const selectedTableFromStorage = ref(null);
    const isChipClosable = ref(true);
    const isShowDialog = ref(false);
    const userData = ref({
      name: null,
      phone: null,
      noOfPeople: null,
      date: null,
      address: null,
      price: null,
      shift: null,
    });
    const userFormData = ref({
      name: null,
      phone: null,
      noOfPeople: null,
      date: null,
      address: null,
      price: null,
      shift: null,
    });
    onMounted(() => {
      selectedDataFromStorage.value =
        JSON.parse(localStorage.getItem("selectedData")) || [];
      selectedTableFromStorage.value =
        JSON.parse(localStorage.getItem("selectedTable")) || null;
      if (JSON.parse(localStorage.getItem("userData")))
        userData.value = JSON.parse(localStorage.getItem("userData"));
      userFormData.value = { ...userFormData.value, ...userData.value }
    });
    const getPDF = async () => {
      try {


        if (!Object.values(userData.value).every((value) => value)) {
          return onToggleDialog();
        }
        isLoading.value = true;
        isChipClosable.value = false;
        if (process.client) {
          const html2pdf = (await import("html2pdf.js")).default;
          // console.log("html2pdf", html2pdf);
          const content = document.getElementById("pdfSection");

          const pdfOptions = {
            margin: [2, 2],
            filename: "generated-pdf.pdf",
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          };

          const pdfResponse = await html2pdf()
            .from(content)
            .set(pdfOptions)
            .toPdf()
            .save(`${userData.value.name}-${userData.value.date}.pdf`);
          // localStorage.clear();
          navigateTo("/");
          isLoading.value = false;
        }
      } catch (error) {
        console.log("pdf genrate error:", error)
      }
    };

    const onGotoHome = () => navigateTo("/");

    const removeItem = (itemId, categoryId) => {
      const categoryIndex = selectedDataFromStorage.value.findIndex(
        (item) => item.id === categoryId
      );
      if (categoryIndex != -1) {
        const itemIndex = selectedDataFromStorage.value[
          categoryIndex
        ].items.findIndex((item) => item.id === itemId);
        if (itemIndex != -1) {
          if (selectedDataFromStorage.value[categoryIndex].items.length === 1) {
            selectedDataFromStorage.value.splice(categoryIndex, 1);
          } else {
            selectedDataFromStorage.value[categoryIndex].items.splice(
              itemIndex,
              1
            );
          }
          localStorage.setItem(
            "selectedData",
            JSON.stringify(selectedDataFromStorage.value)
          );
        }
      }
    };
    const onAddUser = () => {
      if (!Object.values(userFormData.value).every((value) => value)) {
        return (errorMessage.value = "Please Fill All Field !");
      }
      localStorage.setItem("userData", JSON.stringify(userFormData.value));
      userData.value = { ...userFormData.value }
      onToggleDialog();
    };

    const onToggleDialog = () => {
      isShowDialog.value = !isShowDialog.value;
      userFormData.value = { ...userFormData.value, ...userData.value }
    };
    const removeTable = () => {
      localStorage.removeItem("selectedTable");
      selectedTableFromStorage.value = null
    };
    const toggleAddItemDialog = () => {
      isShowAddItemDialog.value = !isShowAddItemDialog.value
      isEditMode.value = false
      if (!isShowAddItemDialog.value)
        newItemFormData.value = [{ id: uuid.v4(), name: null, items: [] }]
    }
    const newItemFormData = ref([{ id: uuid.v4(), name: null, items: [] }])
    const onSaveData = () => {
      if (isEditMode.value) {
        selectedDataFromStorage.value.forEach((item) => {
          if (newItemFormData.value.length && item.id === newItemFormData.value[0].id) {
            item.items = newItemFormData.value[0].items
          }
        })
      } else {
        selectedDataFromStorage.value = [...selectedDataFromStorage.value, ...newItemFormData.value.filter((category) => category.items.length)]
      }

      localStorage.setItem("selectedData", JSON.stringify(selectedDataFromStorage.value));
      newItemFormData.value = [{ id: uuid.v4(), name: null, items: [] }]
      toggleAddItemDialog();
      isEditMode.value = false
    }
    const onAddNewItem = (type, item) => {
      if (type === 'subItem') {
        item.push({ id: uuid.v4(), name: null })
      } else if (type === "category") {
        newItemFormData.value.push({ id: uuid.v4(), name: null, items: [] })
      }
    }
    const isEditMode = ref(false)
    const editCategoryItems = (category) => {
      if (category?.items?.length) {
        category.items.forEach((item) => {
          item['disable'] = true
        })
      }
      newItemFormData.value = JSON.parse(JSON.stringify([category]))
      toggleAddItemDialog()
      isEditMode.value = true
    }


    return {
      selectedDataFromStorage,
      selectedTableFromStorage,
      getPDF,
      onGotoHome,
      userData,
      removeItem,
      removeTable,
      isChipClosable,
      isShowDialog,
      onToggleDialog,
      errorMessage,
      onAddUser,
      isLoading,
      userFormData,
      onAddNewItem,
      isShowAddItemDialog,
      toggleAddItemDialog,
      newItemFormData,
      onSaveData,
      editCategoryItems,
      isEditMode

    };
  },
};
</script>
<style scoped>
.new-item-form-container {
  width: 350px;
}



.sub-item-wrapper {
  display: flex;
  flex-direction: column;
}

.display-fex-row {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 8px;

}
.display-fex-row-only {
  display: flex;
  flex-direction: row;


}

.display-flex {
  display: flex;
  flex-direction: column-reverse;
}

.sub-category-wrap {
  margin-left: 10px;
}

.display-fex-row span {
  font-size: large;
}
</style>