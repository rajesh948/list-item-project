import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';

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

// Sample categories with items
const sampleCategories = [
  {
    id: 1,
    name: 'Appetizers',
    items: [
      { id: 1, name: 'Spring Rolls', image: null },
      { id: 2, name: 'Bruschetta', image: null },
      { id: 3, name: 'Chicken Wings', image: null },
      { id: 4, name: 'Samosa', image: null },
      { id: 5, name: 'Pakora', image: null },
    ],
  },
  {
    id: 2,
    name: 'Main Course',
    items: [
      { id: 1, name: 'Grilled Chicken', image: null },
      { id: 2, name: 'Pasta Alfredo', image: null },
      { id: 3, name: 'Beef Steak', image: null },
      { id: 4, name: 'Paneer Butter Masala', image: null },
      { id: 5, name: 'Biryani', image: null },
      { id: 6, name: 'Dal Makhani', image: null },
    ],
  },
  {
    id: 3,
    name: 'Desserts',
    items: [
      { id: 1, name: 'Chocolate Cake', image: null },
      { id: 2, name: 'Ice Cream', image: null },
      { id: 3, name: 'Fruit Salad', image: null },
      { id: 4, name: 'Gulab Jamun', image: null },
      { id: 5, name: 'Rasgulla', image: null },
    ],
  },
  {
    id: 4,
    name: 'Beverages',
    items: [
      { id: 1, name: 'Fresh Juice', image: null },
      { id: 2, name: 'Coffee', image: null },
      { id: 3, name: 'Tea', image: null },
      { id: 4, name: 'Soft Drinks', image: null },
      { id: 5, name: 'Lassi', image: null },
    ],
  },
  {
    id: 5,
    name: 'Breads',
    items: [
      { id: 1, name: 'Naan', image: null },
      { id: 2, name: 'Roti', image: null },
      { id: 3, name: 'Paratha', image: null },
      { id: 4, name: 'Kulcha', image: null },
    ],
  },
  {
    id: 6,
    name: 'Salads',
    items: [
      { id: 1, name: 'Garden Salad', image: null },
      { id: 2, name: 'Caesar Salad', image: null },
      { id: 3, name: 'Greek Salad', image: null },
      { id: 4, name: 'Fruit Salad', image: null },
    ],
  },
];

async function seedDatabase() {
  console.log('🚀 Starting database seeding...\n');

  try {
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
    for (const category of sampleCategories) {
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
    console.log(`   - Categories created: ${sampleCategories.length}`);
    console.log(`   - Total items: ${totalItems}`);
    console.log('\n🎉 Your CaterPro app is ready to use!\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
