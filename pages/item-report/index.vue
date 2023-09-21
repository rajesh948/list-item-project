<template>
  <div class="mt-5">
    <v-sheet border id="pdfSection">
      <v-container>
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
          <v-divider :thickness="2" class="my-3"></v-divider>
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
</template>
<script>
export default {
  setup() {
    const selectedDataFromStorage = ref(null);
    onMounted(() => {
      selectedDataFromStorage.value =
        JSON.parse(localStorage.getItem("selectedData")) || [];
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

        html2pdf().from(content).set(pdfOptions).toPdf().save("myfile.pdf");
        localStorage.clear();
      }
    };

    return { selectedDataFromStorage, getPDF };
  },
};
</script>
