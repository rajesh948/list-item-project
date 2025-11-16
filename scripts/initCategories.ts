import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Initialize Categories Collection
 * Run this script once to create sample categories in Firestore
 */

const sampleCategories = [
  {
    id: 1,
    name: 'Appetizers',
    items: [
      { id: 1, name: 'Spring Rolls', image: null },
      { id: 2, name: 'Bruschetta', image: null },
      { id: 3, name: 'Chicken Wings', image: null },
    ],
  },
  {
    id: 2,
    name: 'Main Course',
    items: [
      { id: 1, name: 'Grilled Chicken', image: null },
      { id: 2, name: 'Pasta Alfredo', image: null },
      { id: 3, name: 'Beef Steak', image: null },
    ],
  },
  {
    id: 3,
    name: 'Desserts',
    items: [
      { id: 1, name: 'Chocolate Cake', image: null },
      { id: 2, name: 'Ice Cream', image: null },
      { id: 3, name: 'Fruit Salad', image: null },
    ],
  },
  {
    id: 4,
    name: 'Beverages',
    items: [
      { id: 1, name: 'Fresh Juice', image: null },
      { id: 2, name: 'Coffee', image: null },
      { id: 3, name: 'Tea', image: null },
    ],
  },
];

export async function initializeCategories() {
  try {
    console.log('🔍 Checking existing categories...');

    // Check if categories already exist
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));

    if (!categoriesSnapshot.empty) {
      console.log(`⚠️  Categories collection already has ${categoriesSnapshot.size} documents.`);
      console.log('Skipping initialization to avoid duplicates.');
      return { success: false, message: 'Categories already exist' };
    }

    console.log('✨ Creating sample categories...');

    // Add each category to Firestore
    for (const category of sampleCategories) {
      await addDoc(collection(db, 'categories'), {
        ...category,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`✅ Created category: ${category.name}`);
    }

    console.log('\n🎉 Successfully initialized categories collection!');
    console.log(`📊 Total categories created: ${sampleCategories.length}`);

    return { success: true, message: 'Categories initialized successfully' };
  } catch (error) {
    console.error('❌ Error initializing categories:', error);
    return { success: false, message: 'Failed to initialize categories', error };
  }
}

// Self-executing function if run directly
if (typeof window !== 'undefined') {
  console.log('⚠️  This script should be run from a page component or admin panel.');
  console.log('Import and call initializeCategories() function.');
}
