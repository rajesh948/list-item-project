import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAudiW6v9OlVudtm2hIS3O68z86c-MjiJE",
  authDomain: "catering-app-e0a17.firebaseapp.com",
  projectId: "catering-app-e0a17",
  storageBucket: "catering-app-e0a17.firebasestorage.app",
  messagingSenderId: "4179994158",
  appId: "1:4179994158:web:a56fa92eebe7c9358be1bf",
  measurementId: "G-7KDPWJZKQL"
};

// Read and extract data from useData.ts
function extractDataFromFile() {
  const useDataPath = path.join(__dirname, '../composables/useData.ts');
  const fileContent = fs.readFileSync(useDataPath, 'utf-8');

  // Extract the data array from the file
  const dataMatch = fileContent.match(/const data = (\[[\s\S]*?\]);[\s\S]*?const decorationTable/);

  if (!dataMatch) {
    throw new Error('Could not find data array in useData.ts');
  }

  // Parse the data array
  const dataStr = dataMatch[1];
  // Use Function constructor to safely evaluate the array
  const data = new Function(`return ${dataStr}`)();

  return data;
}

async function seedDatabase() {
  console.log('🚀 Starting database seeding from useData.ts...\n');

  try {
    // Extract data from useData.ts
    console.log('📖 Reading data from useData.ts...');
    const categories = extractDataFromFile();
    console.log(`✅ Found ${categories.length} categories\n`);

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log('✅ Connected to Firebase\n');

    // Check if categories already exist
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));

    if (!categoriesSnapshot.empty) {
      console.log(`⚠️  Database already has ${categoriesSnapshot.size} categories.`);
      console.log('❌ Skipping seed to avoid duplicates.\n');
      console.log('💡 Tip: Delete existing categories from Firebase Console if you want to re-seed.\n');
      process.exit(0);
    }

    console.log('📦 Adding categories to Firestore...\n');

    // Add each category to Firestore
    let totalItems = 0;
    for (const category of categories) {
      await addDoc(collection(db, 'categories'), {
        ...category,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`  ✓ Added category: ${category.name} (${category.items.length} items)`);
      totalItems += category.items.length;
    }

    console.log('\n✨ Database seeding completed successfully!\n');
    console.log(`📊 Summary:`);
    console.log(`   - Categories created: ${categories.length}`);
    console.log(`   - Total items: ${totalItems}`);
    console.log('\n🎉 Your CaterHub app is ready to use!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding database:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
