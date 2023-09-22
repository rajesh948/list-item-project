<template>
  <div class="mt-5" v-if="selectedDataFromStorage?.length">
    <v-sheet border id="pdfSection">
      <v-container>
        <v-sheet border class="pa-2 text-sm-h6 font-weight-bold">
          <div class="px-sm-10">
            <v-row align="center">
              <v-col class="pa-1" cols="6"> Name: {{ userData.name }} </v-col>
              <v-col class="pa-1" cols="6"> Phone: {{ userData.phone }} </v-col>
              <v-col class="pa-1" cols="6">
                People No: {{ userData.noOfPeople }}
              </v-col>
              <v-col class="pa-1" cols="6"> Date: {{ userData.date }} </v-col>
            </v-row>
          </div>
        </v-sheet>
        <v-divider :thickness="2" class="my-2"></v-divider>
        <div v-for="category in selectedDataFromStorage" :key="category.name">
          <h4>{{ category.name }}</h4>
          <v-row align="center" no-gutters>
            <v-sheet v-for="item in category.items" :key="item.name">
              <!-- <v-sheet border rounded class="text-center rounded pa-1 ma-2">
                {{ item.name }}
              </v-sheet> -->
              <v-chip class="ma-1" label>
                {{ item.name }}
              </v-chip>
            </v-sheet>
          </v-row>
        </div>
      </v-container>
    </v-sheet>
    <div class="text-center my-3">
      <v-btn
        class="pa-3"
        icon="mdi-file-download-outline"
        size="extra-large"
        @click="getPDF"
      ></v-btn>
    </div>
  </div>
  <v-chip
    @click="onGotoHome"
    v-else
    class="d-flex justify-center text-h4 my-16 pa-16 font-weight-black"
    variant="plain"
  >
    Please Add Items
  </v-chip>
</template>
<script>
export default {
  setup() {
    const selectedDataFromStorage = ref(null);
    const userData = ref(null);
    onMounted(() => {
      selectedDataFromStorage.value =
        JSON.parse(localStorage.getItem("selectedData")) || [];
      userData.value = JSON.parse(localStorage.getItem("userData"));
    });
    const getPDF = async () => {
      if (process.client) {
        const html2pdf = (await import("html2pdf.js")).default;
        console.log("html2pdf", html2pdf);
        const content = document.getElementById("pdfSection");

        const pdfOptions = {
          margin: [10, 10],
          filename: "generated-pdf.pdf",
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        };

        html2pdf().from(content).set(pdfOptions).toPdf().save("itemList.pdf");
        localStorage.clear();
        navigateTo("/");
      }
    };

    const onGotoHome = () => navigateTo("/");

    return { selectedDataFromStorage, getPDF, onGotoHome, userData };
  },
};
</script>
