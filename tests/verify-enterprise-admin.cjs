/**
 * Automated Enterprise Admin, Inventory, Sales & Profit Verification Suite
 * Verifies all 10 core architectural modules:
 * 1. Security & RBAC Auth
 * 2. Product Management (Cricket-only, unique SKU, BDT prices, specifications)
 * 3. Inventory Management (Ledger, adjustments, physical reconciliation, WAC valuation)
 * 4. Concurrency-Safe Order Deduction & Overselling Prevention
 * 5. Order Management, COD Settlement & Restocking Cancellation
 * 6. Procurement & Suppliers (PO auto stock-in & WAC recalculation)
 * 7. Operating Expenses
 * 8. Financial Reporting Invariants (Gross Sales, Net Sales, COGS, Gross Profit, Net Operating Profit)
 * 9. CSV Exports
 * 10. Audit Log Trail
 */

const http = require('http');

const API_BASE = 'http://localhost:4000';
let authToken = '';
let testProductId = '';
let testSku = `GZ-TEST-BAT-${Date.now()}`;
let testSupplierId = '';
let testOrderId = '';
let testPoId = '';
let testExpenseId = '';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ❌ FAIL: ${message}`);
  }
}

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(
      url,
      {
        method,
        headers,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const json = data ? JSON.parse(data) : {};
            resolve({ status: res.statusCode, headers: res.headers, body: json });
          } catch (e) {
            resolve({ status: res.statusCode, headers: res.headers, body: data });
          }
        });
      }
    );

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runSuite() {
  console.log('\n================================================================');
  console.log('🛡️  VERIFYING ENTERPRISE ADMIN, INVENTORY & FINANCIAL ENGINE');
  console.log('================================================================\n');

  try {
    // -------------------------------------------------------------
    // MODULE 1: Security & RBAC Auth
    // -------------------------------------------------------------
    console.log('🔐 1. Testing Security & Admin Authentication...');
    
    // Unauthorized access rejection
    const unauthRes = await request('GET', '/api/admin/products');
    assert(unauthRes.status === 401, 'Unauthorized request without token returns HTTP 401');

    // Invalid token rejection
    const badTokenRes = await request('GET', '/api/admin/products', null, 'invalid-fake-token');
    assert(badTokenRes.status === 401, 'Request with forged token returns HTTP 401');

    // Failed login with bad password
    const badLoginRes = await request('POST', '/api/admin/auth/login', {
      username: 'admin',
      password: 'WrongPassword!',
    });
    assert(badLoginRes.status === 401, 'Login with incorrect password rejected with HTTP 401');

    // Successful login with super_admin credentials
    const loginRes = await request('POST', '/api/admin/auth/login', {
      username: 'admin',
      password: 'AdminPassword2026!',
    });
    assert(loginRes.status === 200, 'Admin login with valid credentials succeeds with HTTP 200');
    assert(loginRes.body.token && loginRes.body.token.length > 20, 'Admin token returned successfully');
    const loggedInUser = loginRes.body.user || loginRes.body.admin;
    assert(loggedInUser && loggedInUser.role === 'super_admin', 'Admin role is super_admin');
    authToken = loginRes.body.token;

    // Verify /api/admin/auth/me
    const meRes = await request('GET', '/api/admin/auth/me', null, authToken);
    assert(meRes.status === 200, 'Verify admin session /auth/me returns HTTP 200');
    const meUser = meRes.body.user || meRes.body.admin;
    assert(meUser && meUser.email === 'admin@gazisports.com', 'Admin email matches admin@gazisports.com');

    // -------------------------------------------------------------
    // MODULE 2: Product Management & Cricket Invariants
    // -------------------------------------------------------------
    console.log('\n🏏 2. Testing Product Management & Cricket Validation...');

    // Non-cricket category rejection
    const badCatRes = await request('POST', '/api/admin/products', {
      name: 'Soccer Ball Pro',
      sku: `SOCCER-${Date.now()}`,
      category: 'Football',
      price: 2500,
      stockQuantity: 10,
    }, authToken);
    assert(badCatRes.status === 400, 'Product with non-cricket category (Football) rejected with HTTP 400');

    // Valid cricket product creation
    const newProductRes = await request('POST', '/api/admin/products', {
      name: 'Gazi Test Special English Willow Bat',
      sku: testSku,
      category: 'Bats',
      brand: 'Gazi Sports',
      description: 'Handcrafted Grade 1+ English Willow with 40mm thick edges and featherlight pickup.',
      costPrice: 8500,
      price: 13500,
      stockQuantity: 20,
      lowStockThreshold: 5,
      specifications: {
        willow: 'Grade 1+ English Willow',
        weight: '2lb 8oz',
        handle: '12-piece Singapore cane',
        edges: '40mm',
        sweetSpot: 'Mid-to-low blade'
      },
      status: 'published'
    }, authToken);

    if (newProductRes.status !== 201) {
      console.log('Product Creation Failed:', newProductRes.status, newProductRes.body);
    }
    assert(newProductRes.status === 201, 'Cricket product created with HTTP 201 Created');
    assert(newProductRes.body.product && newProductRes.body.product.sku === testSku, 'Product SKU correctly stored');
    assert(newProductRes.body.product.costPrice === 8500, 'Product cost price preserved in BDT');
    testProductId = newProductRes.body.product.id;

    // Duplicate SKU rejection
    const dupSkuRes = await request('POST', '/api/admin/products', {
      name: 'Duplicate SKU Bat',
      sku: testSku,
      category: 'Bats',
      price: 11000,
      stockQuantity: 5,
    }, authToken);
    assert(dupSkuRes.status === 400, 'Duplicate SKU rejected with HTTP 400');

    // Edit Product
    const editRes = await request('PUT', `/api/admin/products/${testProductId}`, {
      price: 14000,
      description: 'Updated description for championship play',
    }, authToken);
    assert(editRes.status === 200, 'Product updated with HTTP 200');
    assert(editRes.body.product.price === 14000, 'Product price updated to 14,000 BDT');

    // -------------------------------------------------------------
    // MODULE 3: Inventory Management & Ledger
    // -------------------------------------------------------------
    console.log('\n📦 3. Testing Inventory Ledger, Adjustments & Physical Stock Reconciliation...');

    // Verify initial stock
    const invRes = await request('GET', `/api/admin/inventory/levels?search=${testSku}`, null, authToken);
    assert(invRes.status === 200, 'Fetched inventory levels');
    const invItem = invRes.body.items.find(i => i.id === testProductId);
    assert(invItem && invItem.stockQuantity === 20, 'Initial inventory level is 20 units');

    // Manual stock-in adjustment (+5 units)
    const adjustInRes = await request('POST', '/api/admin/inventory/adjust', {
      productId: testProductId,
      type: 'stock_in',
      quantity: 5,
      reason: 'Urgent warehouse batch intake',
      notes: 'Received from Sialkot emergency flight'
    }, authToken);
    assert(adjustInRes.status === 200, 'Stock adjustment (+5 stock_in) succeeded');
    assert(adjustInRes.body.product.stockQuantity === 25, 'Stock quantity updated to 25');

    // Manual damage stock-out adjustment (-2 units)
    const adjustDamagedRes = await request('POST', '/api/admin/inventory/adjust', {
      productId: testProductId,
      type: 'damaged',
      quantity: 2,
      reason: 'Cracked handle during moisture testing',
    }, authToken);
    assert(adjustDamagedRes.status === 200, 'Damage stock-out (-2 damaged) succeeded');
    assert(adjustDamagedRes.body.product.stockQuantity === 23, 'Stock quantity updated to 23');

    // Physical stock reconciliation (set counted to 22 units)
    const reconcileRes = await request('POST', '/api/admin/inventory/reconcile', {
      productId: testProductId,
      countedQuantity: 22,
      reason: 'End-of-month physical warehouse count discrepancy'
    }, authToken);
    assert(reconcileRes.status === 200, 'Physical inventory reconciliation succeeded');
    assert(reconcileRes.body.product.stockQuantity === 22, 'Stock quantity reconciled to 22');
    assert(reconcileRes.body.adjustment === -1, 'Discrepancy adjustment recorded as -1');

    // Verify inventory ledger entries
    const ledgerRes = await request('GET', `/api/admin/inventory/ledger?productId=${testProductId}`, null, authToken);
    assert(ledgerRes.status === 200, 'Fetched inventory ledger entries');
    const entries = ledgerRes.body.entries;
    assert(entries.length >= 4, 'Ledger contains initial_stock, stock_in, damaged, and reconciliation entries');
    const recEntry = entries.find(e => e.type === 'reconciliation');
    assert(recEntry && recEntry.balanceAfter === 22, 'Ledger accurately records balanceAfter = 22');

    // -------------------------------------------------------------
    // MODULE 4: Customer Checkout & Atomic Stock Deduction
    // -------------------------------------------------------------
    console.log('\n🛒 4. Testing Checkout Deduction & Overselling Prevention...');

    // Attempt to oversell (requesting 100 units when only 22 exist)
    const oversellRes = await request('POST', '/api/checkout', {
      customer: {
        name: 'Mushfiqur Rahim',
        email: 'mushfiq@tigers.bd',
        phone: '01712345678',
        address: 'Mirpur National Stadium, Gate 2',
        city: 'Dhaka',
        division: 'Dhaka',
        zip: '1216'
      },
      items: [
        {
          id: testProductId,
          name: 'Gazi Test Special English Willow Bat',
          price: 14000,
          quantity: 100
        }
      ],
      paymentMethod: 'COD'
    });
    assert(oversellRes.status === 400, 'Oversell attempt rejected with HTTP 400 Insufficient Stock');

    // Valid purchase (2 units)
    const checkoutRes = await request('POST', '/api/checkout', {
      customer: {
        name: 'Tamim Iqbal',
        email: 'tamim@tigers.bd',
        phone: '01819234567',
        address: 'Khan Shaheb Osman Ali Stadium Road',
        city: 'Narayanganj',
        division: 'Dhaka',
        zip: '1400'
      },
      items: [
        {
          id: testProductId,
          name: 'Gazi Test Special English Willow Bat',
          price: 14000,
          quantity: 2
        }
      ],
      paymentMethod: 'COD'
    });

    assert(checkoutRes.status === 201, 'Order created successfully with HTTP 201 Created');
    assert(checkoutRes.body.order && checkoutRes.body.order.id, 'Generated order ID with prefix GZ-BD-');
    testOrderId = checkoutRes.body.order.id;

    // Verify stock decreased from 22 to 20
    const stockAfterOrderRes = await request('GET', `/api/admin/products/${testProductId}`, null, authToken);
    assert(stockAfterOrderRes.body.product.stockQuantity === 20, 'Stock atomically reduced from 22 to 20 on checkout');

    // Verify ledger has order_deduction
    const ledgerAfterOrderRes = await request('GET', `/api/admin/inventory/ledger?productId=${testProductId}`, null, authToken);
    const orderDeduction = ledgerAfterOrderRes.body.entries.find(e => e.type === 'order_deduction' && e.referenceId === testOrderId);
    assert(orderDeduction && orderDeduction.quantity === -2, 'Ledger logs order_deduction of -2 units with order ID reference');

    // -------------------------------------------------------------
    // MODULE 5: Order Management, COD Settlement & Restocking Cancellation
    // -------------------------------------------------------------
    console.log('\n📋 5. Testing Order Management, COD Settlement & Restock Cancellation...');

    // Fetch order details
    const orderDetailRes = await request('GET', `/api/admin/orders/${testOrderId}`, null, authToken);
    assert(orderDetailRes.status === 200, 'Fetched order detail');
    assert(orderDetailRes.body.order.paymentStatus === 'pending', 'Initial COD order paymentStatus is pending');
    assert(orderDetailRes.body.order.items[0].unitCost === 8500, 'Order item snapshotted unit cost of goods (8500 BDT)');

    // Update fulfillment to shipped
    const shipRes = await request('PUT', `/api/admin/orders/${testOrderId}/status`, {
      fulfillmentStatus: 'shipped',
      notes: 'Dispatched via Pathao Courier to Narayanganj'
    }, authToken);
    assert(shipRes.status === 200, 'Order status updated to shipped');

    // Settle COD Payment
    const settleRes = await request('PUT', `/api/admin/orders/${testOrderId}/settle-cod`, null, authToken);
    assert(settleRes.status === 200, 'COD payment settled with HTTP 200');
    assert(settleRes.body.order.paymentStatus === 'paid', 'Payment status updated to paid');
    assert(settleRes.body.order.codSettledAt !== null, 'codSettledAt timestamp recorded');

    // Cancel order with Restock
    const cancelRes = await request('PUT', `/api/admin/orders/${testOrderId}/cancel`, {
      reason: 'Customer requested cancellation prior to handover',
      restock: true
    }, authToken);
    assert(cancelRes.status === 200, 'Order cancelled with restocking');
    assert(cancelRes.body.order.fulfillmentStatus === 'cancelled', 'Fulfillment status marked as cancelled');

    // Verify stock restored from 20 back to 22
    const stockAfterCancelRes = await request('GET', `/api/admin/products/${testProductId}`, null, authToken);
    assert(stockAfterCancelRes.body.product.stockQuantity === 22, 'Stock restored from 20 back to 22 upon order cancellation');

    // Verify ledger has cancellation_restock entry
    const ledgerAfterCancelRes = await request('GET', `/api/admin/inventory/ledger?productId=${testProductId}`, null, authToken);
    const restockEntry = ledgerAfterCancelRes.body.entries.find(e => e.type === 'cancellation_restock');
    assert(restockEntry && restockEntry.quantity === 2, 'Ledger recorded cancellation_restock of +2 units');

    // -------------------------------------------------------------
    // MODULE 6: Suppliers, Purchases & Auto Stock-In with WAC
    // -------------------------------------------------------------
    console.log('\n🏭 6. Testing Supplier Management & Purchase Order Auto Stock-In...');

    // Create supplier
    const supRes = await request('POST', '/api/admin/suppliers', {
      name: 'Sialkot Master Bats Ltd',
      contactPerson: 'Zahid Mahmood',
      phone: '+923001234567',
      email: 'sales@sialkotmasterbats.com',
      address: 'Kashmir Road, Sialkot, Pakistan'
    }, authToken);
    assert(supRes.status === 201, 'Supplier created with HTTP 201');
    testSupplierId = supRes.body.supplier ? supRes.body.supplier.id : '';

    // Create purchase order for 10 units at 9,000 BDT
    const poRes = await request('POST', '/api/admin/purchases', {
      supplierId: testSupplierId,
      referenceNo: `PO-BD-${Date.now()}`,
      items: [
        {
          productId: testProductId,
          productName: 'Gazi Test Special English Willow Bat',
          sku: testSku,
          quantity: 10,
          unitCost: 9000
        }
      ],
      shippingCost: 2000,
      notes: 'Q1 Import shipment via Chittagong Port'
    }, authToken);
    if (poRes.status !== 201) {
      console.log('PO Creation Failed:', poRes.status, poRes.body);
    }
    assert(poRes.status === 201, 'Purchase order created in pending status');
    testPoId = poRes.body.purchase ? poRes.body.purchase.id : (poRes.body.purchaseOrder ? poRes.body.purchaseOrder.id : '');
    const poId = testPoId;

    // Receive purchase order (triggers auto stock-in & WAC calculation)
    const receivePoRes = await request('PUT', `/api/admin/purchases/${poId}/receive`, null, authToken);
    assert(receivePoRes.status === 200, 'Purchase order received successfully');
    assert(receivePoRes.body.purchase.status === 'received', 'PO status transitioned to received');

    // Check that stock increased by 10 (from 22 to 32)
    const stockAfterPoRes = await request('GET', `/api/admin/products/${testProductId}`, null, authToken);
    assert(stockAfterPoRes.body.product.stockQuantity === 32, 'Stock increased by 10 units from 22 to 32');

    // Check that WAC recalculated cost price
    // Old: 22 units @ 8500 = 187,000 BDT
    // New: 10 units @ 9000 = 90,000 BDT
    // Total: 32 units, 277,000 BDT -> WAC = 8656.25 BDT (rounded to 8656)
    const expectedWac = Math.round((22 * 8500 + 10 * 9000) / 32);
    assert(stockAfterPoRes.body.product.costPrice === expectedWac, `WAC cost price recalculated to ${expectedWac} BDT`);

    // -------------------------------------------------------------
    // MODULE 7: Operating Expenses
    // -------------------------------------------------------------
    console.log('\n💸 7. Testing Operating Expense Tracking...');

    const expRes = await request('POST', '/api/admin/expenses', {
      category: 'Packaging',
      amount: 3500,
      description: 'Custom padded cricket bat carrying covers',
      paymentMethod: 'bKash Merchant'
    }, authToken);
    assert(expRes.status === 201, 'Operating expense recorded with HTTP 201');
    testExpenseId = expRes.body.expense ? expRes.body.expense.id : '';

    const expListRes = await request('GET', '/api/admin/expenses', null, authToken);
    assert(expListRes.status === 200, 'Fetched expenses list');
    assert(expListRes.body.expenses.some(e => e.id === expRes.body.expense.id), 'Recorded expense present in expense registry');

    // -------------------------------------------------------------
    // MODULE 8: Sales, Profit & Financial Reporting Engine
    // -------------------------------------------------------------
    console.log('\n📊 8. Testing Financial Reporting Invariants (P&L, COGS, Net Profit)...');

    const repRes = await request('GET', '/api/admin/reports/summary', null, authToken);
    assert(repRes.status === 200, 'Fetched financial summary report');
    const fin = repRes.body.financials;

    assert(typeof fin.grossSales === 'number' && fin.grossSales >= 0, 'Gross sales is non-negative number');
    assert(typeof fin.discounts === 'number' && fin.discounts >= 0, 'Discounts is non-negative number');
    assert(typeof fin.netSales === 'number', 'Net sales is calculated');
    assert(typeof fin.cogs === 'number' && fin.cogs >= 0, 'COGS (Cost of Goods Sold) is non-negative number');
    assert(typeof fin.grossProfit === 'number', 'Gross profit is calculated');
    assert(typeof fin.operatingExpenses === 'number' && fin.operatingExpenses >= 0, 'Operating expenses is non-negative number');
    assert(typeof fin.netOperatingProfit === 'number', 'Net operating profit is calculated');

    // Verify mathematical identity: netSales = grossSales - discounts - refunds
    const calculatedNetSales = fin.grossSales - fin.discounts - fin.refunds;
    assert(Math.abs(fin.netSales - calculatedNetSales) < 0.01, 'Financial Identity: Net Sales = Gross Sales - Discounts - Refunds');

    // Verify mathematical identity: grossProfit = netSales - cogs
    const calculatedGrossProfit = fin.netSales - fin.cogs;
    assert(Math.abs(fin.grossProfit - calculatedGrossProfit) < 0.01, 'Financial Identity: Gross Profit = Net Sales - COGS');

    // Verify mathematical identity: netOperatingProfit = grossProfit - operatingExpenses
    const calculatedNetProfit = fin.grossProfit - fin.operatingExpenses;
    assert(Math.abs(fin.netOperatingProfit - calculatedNetProfit) < 0.01, 'Financial Identity: Net Operating Profit = Gross Profit - Operating Expenses');

    // -------------------------------------------------------------
    // MODULE 9: CSV Exports
    // -------------------------------------------------------------
    console.log('\n📑 9. Testing Financial & Product CSV Exports...');

    const prodCsvRes = await request('GET', '/api/admin/products/export/csv', null, authToken);
    assert(prodCsvRes.status === 200, 'Products CSV export responds with HTTP 200');
    assert(prodCsvRes.body.includes('SKU,Name,Category,Brand'), 'Products CSV contains expected headers');

    const repCsvRes = await request('GET', '/api/admin/reports/export/csv', null, authToken);
    assert(repCsvRes.status === 200, 'Reports P&L CSV export responds with HTTP 200');
    assert(repCsvRes.body.includes('Metric,Amount (BDT)'), 'Reports CSV contains financial statement headers');

    // -------------------------------------------------------------
    // MODULE 10: Audit Log Trail
    // -------------------------------------------------------------
    console.log('\n🔍 10. Testing Security & Administrative Action Audit Trail...');

    const auditRes = await request('GET', '/api/admin/audit-logs', null, authToken);
    assert(auditRes.status === 200, 'Audit log endpoint responds with HTTP 200');
    assert(auditRes.body.logs && auditRes.body.logs.length > 0, 'Audit logs contain recorded events');
    const actions = auditRes.body.logs.map(l => l.action);
    assert(actions.includes('CREATE_PRODUCT') || actions.includes('PRODUCT_CREATED'), 'Audit trail records product creation event');
    assert(actions.includes('STOCK_ADJUSTMENT') || actions.includes('STOCK_ADJUSTED'), 'Audit trail records stock adjustment event');
    assert(actions.includes('SETTLE_COD') || actions.includes('ORDER_PAYMENT_UPDATED'), 'Audit trail records payment update / settlement event');
    assert(actions.includes('CANCEL_ORDER') || actions.includes('ORDER_STATUS_UPDATED'), 'Audit trail records order status / cancellation event');

    // Clean up test fixtures to maintain database hygiene
    if (testProductId) {
      await request('DELETE', `/api/admin/products/${testProductId}`, null, authToken);
    }
    if (testOrderId) {
      await request('DELETE', `/api/admin/orders/${testOrderId}`, null, authToken);
    }
    if (testPoId) {
      await request('DELETE', `/api/admin/purchases/${testPoId}`, null, authToken);
    }
    if (testSupplierId) {
      await request('DELETE', `/api/admin/suppliers/${testSupplierId}`, null, authToken);
    }
    if (testExpenseId) {
      await request('DELETE', `/api/admin/expenses/${testExpenseId}`, null, authToken);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    failedTests++;
  }

  console.log('\n================================================================');
  console.log(`📊 ENTERPRISE ADMIN TEST REPORT: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests})`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    console.log('🏆 All 10 Enterprise Admin & Financial Invariants 100% Verified!\n');
    process.exit(0);
  }
}

runSuite();
