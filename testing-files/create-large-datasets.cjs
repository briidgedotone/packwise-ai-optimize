// Script to generate large CSV datasets for comprehensive testing

const fs = require('fs');
const path = require('path');

// Product categories and their typical dimensions
const productCategories = {
  'Electronics': [
    { name: 'Smartphone', dims: [6.2, 3.1, 0.3], weight: [0.4, 0.7] },
    { name: 'Tablet', dims: [10.9, 7.5, 0.25], weight: [1.0, 1.5] },
    { name: 'Laptop', dims: [15.2, 10.8, 1.2], weight: [4.5, 6.5] },
    { name: 'Wireless Headphones', dims: [7.3, 6.1, 3.2], weight: [0.6, 1.2] },
    { name: 'Bluetooth Speaker', dims: [8.7, 4.2, 4.2], weight: [1.5, 2.5] },
    { name: 'Gaming Mouse', dims: [4.7, 2.4, 1.8], weight: [0.2, 0.5] },
    { name: 'Wireless Keyboard', dims: [17.8, 6.2, 1.4], weight: [1.8, 2.5] },
    { name: 'USB Hub', dims: [4.9, 2.8, 0.8], weight: [0.3, 0.6] },
    { name: 'Phone Case', dims: [6.8, 3.5, 0.8], weight: [0.1, 0.3] },
    { name: 'Power Bank', dims: [5.9, 2.8, 0.9], weight: [0.8, 1.5] }
  ],
  'Kitchen': [
    { name: 'Coffee Mug', dims: [4.2, 4.2, 4.8], weight: [0.8, 1.2] },
    { name: 'Cutting Board', dims: [16.0, 10.0, 0.75], weight: [2.5, 4.0] },
    { name: 'Kitchen Scale', dims: [8.9, 6.7, 2.1], weight: [2.8, 3.8] },
    { name: 'Lunch Box', dims: [9.8, 7.2, 4.1], weight: [1.5, 2.3] },
    { name: 'Water Bottle', dims: [10.2, 3.1, 3.1], weight: [0.9, 1.5] },
    { name: 'Kitchen Timer', dims: [3.2, 3.2, 1.8], weight: [0.3, 0.6] },
    { name: 'Mixing Bowl Set', dims: [11.5, 11.5, 6.2], weight: [2.1, 3.2] },
    { name: 'Utensil Set', dims: [12.8, 8.4, 2.1], weight: [1.8, 2.5] }
  ],
  'Office': [
    { name: 'Desk Organizer', dims: [14.0, 9.5, 3.2], weight: [2.0, 2.8] },
    { name: 'Notebook Set', dims: [11.8, 8.3, 1.5], weight: [0.6, 1.2] },
    { name: 'LED Desk Lamp', dims: [8.2, 6.4, 18.5], weight: [2.5, 3.5] },
    { name: 'Monitor Stand', dims: [22.4, 8.7, 4.2], weight: [4.2, 5.8] },
    { name: 'Cable Organizer', dims: [12.2, 8.4, 1.8], weight: [0.6, 1.2] },
    { name: 'Desk Mat', dims: [35.4, 15.7, 0.12], weight: [1.2, 1.8] },
    { name: 'Desk Calendar', dims: [11.0, 8.5, 0.5], weight: [0.5, 0.9] },
    { name: 'Pen Holder', dims: [4.2, 4.2, 5.8], weight: [0.8, 1.2] }
  ],
  'Home': [
    { name: 'Picture Frame', dims: [10.4, 8.2, 0.8], weight: [1.2, 1.8] },
    { name: 'Candle Set', dims: [3.2, 3.2, 4.8], weight: [0.7, 1.2] },
    { name: 'Wall Clock', dims: [12.0, 12.0, 2.1], weight: [2.2, 2.8] },
    { name: 'Throw Pillow', dims: [18.0, 18.0, 6.0], weight: [1.5, 2.2] },
    { name: 'Portable Humidifier', dims: [6.8, 6.8, 8.2], weight: [1.8, 2.5] },
    { name: 'Essential Oils Set', dims: [8.4, 6.2, 2.1], weight: [1.0, 1.5] },
    { name: 'Jewelry Box', dims: [9.8, 6.2, 3.4], weight: [1.6, 2.2] },
    { name: 'Storage Basket', dims: [14.2, 10.8, 8.5], weight: [1.8, 2.8] }
  ],
  'Sports': [
    { name: 'Yoga Mat', dims: [24.0, 6.0, 0.25], weight: [2.5, 3.2] },
    { name: 'Water Bottle', dims: [10.2, 3.1, 3.1], weight: [1.0, 1.5] },
    { name: 'Resistance Bands', dims: [8.5, 6.2, 2.8], weight: [0.8, 1.2] },
    { name: 'Gym Towel', dims: [16.0, 24.0, 0.5], weight: [0.8, 1.2] },
    { name: 'Protein Shaker', dims: [4.2, 4.2, 9.8], weight: [0.6, 1.0] },
    { name: 'Exercise Ball', dims: [12.0, 12.0, 12.0], weight: [2.2, 3.0] },
    { name: 'Jump Rope', dims: [10.2, 3.8, 1.2], weight: [0.5, 0.8] }
  ],
  'Fashion': [
    { name: 'T-Shirt', dims: [12.0, 9.0, 1.0], weight: [0.4, 0.8] },
    { name: 'Jeans', dims: [14.0, 10.0, 2.0], weight: [1.2, 1.8] },
    { name: 'Sneakers', dims: [12.5, 8.2, 4.8], weight: [1.8, 2.5] },
    { name: 'Belt', dims: [18.0, 2.0, 0.5], weight: [0.5, 0.9] },
    { name: 'Handbag', dims: [14.2, 10.8, 6.2], weight: [1.5, 2.5] },
    { name: 'Sunglasses', dims: [6.2, 6.0, 2.8], weight: [0.2, 0.4] },
    { name: 'Watch', dims: [2.2, 2.0, 0.8], weight: [0.2, 0.5] }
  ]
};

const priorities = ['standard', 'express', 'overnight'];
const zones = ['domestic', 'zone_2', 'zone_3', 'zone_4', 'zone_5', 'international'];

function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function generateOrderHistory(numOrders) {
  const orders = [];
  orders.push('Order ID,Product Name,Length,Width,Height,Unit,Quantity,Weight,Category,Priority,Zone');
  
  for (let i = 1; i <= numOrders; i++) {
    const category = randomChoice(Object.keys(productCategories));
    const product = randomChoice(productCategories[category]);
    
    // Add some variation to dimensions
    const length = (product.dims[0] * randomRange(0.9, 1.1)).toFixed(1);
    const width = (product.dims[1] * randomRange(0.9, 1.1)).toFixed(1);
    const height = (product.dims[2] * randomRange(0.9, 1.1)).toFixed(1);
    const weight = randomRange(product.weight[0], product.weight[1]).toFixed(1);
    const quantity = Math.floor(randomRange(1, 5));
    
    const orderId = `ORD-2024-${String(i).padStart(6, '0')}`;
    const priority = randomChoice(priorities);
    const zone = randomChoice(zones);
    
    orders.push(
      `${orderId},${product.name},${length},${width},${height},in,${quantity},${weight},${category},${priority},${zone}`
    );
  }
  
  return orders.join('\n');
}

function generatePackagingSuite() {
  const packages = [];
  packages.push('Package Name,Package ID,Length,Width,Height,Unit,Cost per Unit,Package Weight,Max Weight,Material,Type');
  
  // Standard box sizes
  const boxSizes = [
    { name: 'Extra Small Box', id: 'BOX-XS', dims: [4, 4, 4], cost: 0.45, weight: 0.15, maxWeight: 5 },
    { name: 'Small Box', id: 'BOX-SM', dims: [6, 6, 6], cost: 0.65, weight: 0.25, maxWeight: 10 },
    { name: 'Small Flat Box', id: 'BOX-SF', dims: [8, 6, 2], cost: 0.58, weight: 0.22, maxWeight: 8 },
    { name: 'Medium Box', id: 'BOX-MD', dims: [8, 8, 8], cost: 0.85, weight: 0.35, maxWeight: 15 },
    { name: 'Medium Flat Box', id: 'BOX-MF', dims: [12, 9, 3], cost: 0.78, weight: 0.32, maxWeight: 12 },
    { name: 'Large Box', id: 'BOX-LG', dims: [12, 12, 12], cost: 1.25, weight: 0.55, maxWeight: 25 },
    { name: 'Large Flat Box', id: 'BOX-LF', dims: [16, 12, 4], cost: 1.15, weight: 0.48, maxWeight: 20 },
    { name: 'Extra Large Box', id: 'BOX-XL', dims: [16, 16, 16], cost: 1.85, weight: 0.85, maxWeight: 35 },
    { name: 'Jumbo Box', id: 'BOX-JB', dims: [20, 20, 20], cost: 2.45, weight: 1.25, maxWeight: 50 },
    { name: 'Long Box', id: 'BOX-LONG', dims: [24, 6, 6], cost: 1.35, weight: 0.65, maxWeight: 20 },
    { name: 'Tall Box', id: 'BOX-TALL', dims: [8, 8, 16], cost: 1.05, weight: 0.45, maxWeight: 18 },
    { name: 'Wide Box', id: 'BOX-WIDE', dims: [18, 12, 6], cost: 1.45, weight: 0.75, maxWeight: 25 }
  ];
  
  // Mailers and envelopes
  const mailers = [
    { name: 'Small Poly Mailer', id: 'POLY-SM', dims: [6, 9, 0.25], cost: 0.15, weight: 0.05, maxWeight: 1, type: 'envelope' },
    { name: 'Medium Poly Mailer', id: 'POLY-MD', dims: [9, 12, 0.25], cost: 0.22, weight: 0.08, maxWeight: 2, type: 'envelope' },
    { name: 'Large Poly Mailer', id: 'POLY-LG', dims: [12, 15, 0.25], cost: 0.35, weight: 0.12, maxWeight: 3, type: 'envelope' },
    { name: 'Bubble Mailer Small', id: 'BUB-SM', dims: [4, 8, 0.5], cost: 0.45, weight: 0.12, maxWeight: 1, type: 'envelope' },
    { name: 'Bubble Mailer Medium', id: 'BUB-MD', dims: [6, 10, 0.5], cost: 0.65, weight: 0.18, maxWeight: 2, type: 'envelope' },
    { name: 'Bubble Mailer Large', id: 'BUB-LG', dims: [8.5, 12, 0.5], cost: 0.85, weight: 0.25, maxWeight: 3, type: 'envelope' }
  ];
  
  // Specialty boxes
  const specialtyBoxes = [
    { name: 'Electronics Box', id: 'ELEC-STD', dims: [10, 8, 6], cost: 1.45, weight: 0.52, maxWeight: 12 },
    { name: 'Laptop Box', id: 'LAPTOP-STD', dims: [18, 14, 3], cost: 1.75, weight: 0.68, maxWeight: 8 },
    { name: 'Fragile Box Small', id: 'FRAG-SM', dims: [8, 6, 6], cost: 1.25, weight: 0.45, maxWeight: 10 },
    { name: 'Fragile Box Medium', id: 'FRAG-MD', dims: [10, 8, 8], cost: 1.75, weight: 0.65, maxWeight: 15 },
    { name: 'Heavy Duty Small', id: 'HD-SM', dims: [8, 6, 4], cost: 1.65, weight: 0.55, maxWeight: 20 },
    { name: 'Heavy Duty Medium', id: 'HD-MD', dims: [12, 10, 8], cost: 2.25, weight: 0.85, maxWeight: 35 }
  ];
  
  const allPackages = [...boxSizes, ...mailers, ...specialtyBoxes];
  
  allPackages.forEach(pkg => {
    const type = pkg.type || 'box';
    packages.push(
      `${pkg.name},${pkg.id},${pkg.dims[0]},${pkg.dims[1]},${pkg.dims[2]},in,${pkg.cost},${pkg.weight},${pkg.maxWeight},Cardboard,${type}`
    );
  });
  
  return packages.join('\n');
}

function generateBaselineMix() {
  const baseline = [];
  baseline.push('Package Name,Package ID,Usage Percent,Monthly Volume,Average Cost');
  
  const baselineData = [
    { name: 'Medium Box', id: 'BOX-MD', percent: 28.5, cost: 0.85 },
    { name: 'Large Box', id: 'BOX-LG', percent: 22.3, cost: 1.25 },
    { name: 'Small Box', id: 'BOX-SM', percent: 18.2, cost: 0.65 },
    { name: 'Large Poly Mailer', id: 'POLY-LG', percent: 12.8, cost: 0.35 },
    { name: 'Extra Large Box', id: 'BOX-XL', percent: 8.4, cost: 1.85 },
    { name: 'Medium Poly Mailer', id: 'POLY-MD', percent: 6.2, cost: 0.22 },
    { name: 'Wide Box', id: 'BOX-WIDE', percent: 3.6, cost: 1.45 }
  ];
  
  const totalOrders = 1000; // Assuming 1000 orders baseline
  
  baselineData.forEach(item => {
    const volume = Math.round((item.percent / 100) * totalOrders);
    baseline.push(`${item.name},${item.id},${item.percent},${volume},${item.cost}`);
  });
  
  return baseline.join('\n');
}

// Generate large datasets
console.log('Generating large order history dataset (1000 orders)...');
const largeOrderHistory = generateOrderHistory(1000);
fs.writeFileSync('/Users/dsourav/Desktop/packwise-ai-optimize/testing-files/order-history-large.csv', largeOrderHistory);

console.log('Generating comprehensive packaging suite...');
const packagingSuite = generatePackagingSuite();
fs.writeFileSync('/Users/dsourav/Desktop/packwise-ai-optimize/testing-files/packaging-suite-comprehensive.csv', packagingSuite);

console.log('Generating baseline mix data...');
const baselineMix = generateBaselineMix();
fs.writeFileSync('/Users/dsourav/Desktop/packwise-ai-optimize/testing-files/baseline-mix-realistic.csv', baselineMix);

console.log('All test files generated successfully!');
console.log('\nGenerated files:');
console.log('- order-history-large.csv (1000 orders)');
console.log('- packaging-suite-comprehensive.csv');
console.log('- baseline-mix-realistic.csv');