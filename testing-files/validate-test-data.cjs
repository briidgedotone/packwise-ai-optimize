// Validation script for test CSV files
const fs = require('fs');

function validateCSV(filePath, expectedHeaders, requiredFields = []) {
  console.log(`\n📋 Validating: ${filePath}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.trim().split('\n');
    
    if (lines.length < 2) {
      console.log('❌ ERROR: File must have header and at least one data row');
      return false;
    }
    
    const headers = lines[0].split(',').map(h => h.trim());
    console.log(`📄 Headers: ${headers.join(', ')}`);
    console.log(`📊 Data rows: ${lines.length - 1}`);
    
    // Check for required headers
    const missingHeaders = expectedHeaders.filter(h => 
      !headers.some(header => header.toLowerCase().includes(h.toLowerCase()))
    );
    
    if (missingHeaders.length > 0) {
      console.log(`❌ Missing headers: ${missingHeaders.join(', ')}`);
      return false;
    }
    
    // Validate a few sample rows
    let validRows = 0;
    let invalidRows = 0;
    
    for (let i = 1; i <= Math.min(5, lines.length - 1); i++) {
      const row = lines[i].split(',');
      if (row.length === headers.length) {
        validRows++;
      } else {
        invalidRows++;
        console.log(`⚠️  Row ${i}: Expected ${headers.length} columns, got ${row.length}`);
      }
    }
    
    console.log(`✅ Valid sample rows: ${validRows}`);
    if (invalidRows > 0) {
      console.log(`❌ Invalid sample rows: ${invalidRows}`);
    }
    
    return invalidRows === 0;
    
  } catch (error) {
    console.log(`❌ ERROR reading file: ${error.message}`);
    return false;
  }
}

function main() {
  console.log('🧪 SUITE ANALYZER TEST DATA VALIDATION');
  console.log('=====================================');
  
  const testFiles = [
    {
      file: 'order-history-sample.csv',
      headers: ['Order ID', 'Length', 'Width', 'Height', 'Quantity'],
      required: ['Order ID', 'Quantity']
    },
    {
      file: 'order-history-large.csv', 
      headers: ['Order ID', 'Length', 'Width', 'Height', 'Quantity'],
      required: ['Order ID', 'Quantity']
    },
    {
      file: 'packaging-suite-sample.csv',
      headers: ['Package Name', 'Length', 'Width', 'Height', 'Cost'],
      required: ['Package Name', 'Cost']
    },
    {
      file: 'packaging-suite-comprehensive.csv',
      headers: ['Package Name', 'Length', 'Width', 'Height', 'Cost'],
      required: ['Package Name', 'Cost']
    },
    {
      file: 'baseline-mix-sample.csv',
      headers: ['Package Name', 'Usage', 'Volume', 'Cost'],
      required: ['Package Name']
    },
    {
      file: 'baseline-mix-realistic.csv',
      headers: ['Package Name', 'Usage', 'Volume', 'Cost'],
      required: ['Package Name']
    }
  ];
  
  let allValid = true;
  
  testFiles.forEach(test => {
    const isValid = validateCSV(test.file, test.headers, test.required);
    if (!isValid) {
      allValid = false;
    }
  });
  
  console.log('\n🎯 VALIDATION SUMMARY');
  console.log('====================');
  
  if (allValid) {
    console.log('✅ All test files are valid and ready for testing!');
    console.log('\n📋 RECOMMENDED TEST SEQUENCE:');
    console.log('1. Start with order-history-sample.csv (50 orders)');
    console.log('2. Use packaging-suite-sample.csv');
    console.log('3. Add baseline-mix-sample.csv (optional)');
    console.log('4. Set fallback dimensions: Small(4,3,2), Average(8,6,4), Large(16,12,8)');
    console.log('5. Run analysis and verify results');
    console.log('6. Scale up to order-history-large.csv (1000 orders) for performance testing');
  } else {
    console.log('❌ Some test files have issues. Please fix before testing.');
  }
}

main();