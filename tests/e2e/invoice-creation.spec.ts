// End-to-End Test Plan for Invoice Creation with Serialized Products
// This test validates the complete flow from creating a serialized product to generating an invoice

import { test, expect } from '@playwright/test';

/**
 * E2E Test: Create Invoice with Serialized Products and Custom VAT
 * 
 * Prerequisites:
 * - Backend API running on http://localhost:5000
 * - Frontend running on http://localhost:5173
 * - Test user authenticated
 * 
 * Test Flow:
 * 1. Create a serialized product with multiple items (Serial/IMEI)
 * 2. Create or select a customer
 * 3. Create an invoice with the serialized product
 * 4. Select specific serialized items for the invoice
 * 5. Set a custom VAT rate
 * 6. Verify invoice creation and data integrity
 */

test.describe('Invoice Creation with Serialized Products', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to login page
        await page.goto('http://localhost:5173/login');

        // Login (adjust selectors based on your actual login form)
        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'admin123');
        await page.click('button[type="submit"]');

        // Wait for dashboard to load
        await page.waitForURL('**/dashboard');
    });

    test('should create serialized product and invoice with custom VAT', async ({ page }) => {
        // STEP 1: Create a Serialized Product
        console.log('Step 1: Creating serialized product...');

        await page.goto('http://localhost:5173/products');
        await page.click('button:has-text("Add Product")');

        // Fill product form
        await page.fill('input[name="name"]', 'iPhone 15 Pro Max');
        await page.fill('input[name="purchasePrice"]', '4500');
        await page.fill('input[name="sellingPrice"]', '5500');
        await page.fill('input[name="costPrice"]', '4500');

        // Enable serialization
        await page.click('input[name="isSerialized"]');

        // Add serialized items
        await page.click('button:has-text("Add Item")');
        await page.fill('input[name="items.0.serialNumber"]', 'SN001-IPHONE-2024');
        await page.fill('input[name="items.0.imei"]', '123456789012345');

        await page.click('button:has-text("Add Item")');
        await page.fill('input[name="items.1.serialNumber"]', 'SN002-IPHONE-2024');
        await page.fill('input[name="items.1.imei"]', '123456789012346');

        await page.click('button:has-text("Add Item")');
        await page.fill('input[name="items.2.serialNumber"]', 'SN003-IPHONE-2024');
        await page.fill('input[name="items.2.imei"]', '123456789012347');

        // Submit product form
        await page.click('button:has-text("Save")');

        // Wait for success message
        await expect(page.locator('text=Product created successfully')).toBeVisible({ timeout: 5000 });

        // STEP 2: Navigate to Create Invoice
        console.log('Step 2: Navigating to invoice creation...');

        await page.goto('http://localhost:5173/invoices/create');

        // STEP 3: Select/Create Customer
        console.log('Step 3: Selecting customer...');

        // Search for existing customer or create new one
        await page.fill('input[placeholder*="Search customer"]', '+971501234567');
        await page.waitForTimeout(1000);

        // If customer exists, select it; otherwise create new
        const customerExists = await page.locator('text=John Doe').isVisible().catch(() => false);

        if (!customerExists) {
            await page.click('button:has-text("Create New Customer")');
            await page.fill('input[name="fullName"]', 'Test Customer');
            await page.fill('input[name="mobile"]', '+971501234567');
            await page.fill('input[name="email"]', 'test@example.com');
            await page.click('button:has-text("Save Customer")');
        } else {
            await page.click('text=John Doe');
        }

        // Proceed to products step
        await page.click('button:has-text("Next")');

        // STEP 4: Add Serialized Product to Invoice
        console.log('Step 4: Adding serialized product...');

        await page.fill('input[placeholder*="Search products"]', 'iPhone 15');
        await page.waitForTimeout(1000);

        // Click on the product
        await page.click('text=iPhone 15 Pro Max');

        // Select specific serialized items
        await page.click('text=SN001-IPHONE-2024');
        await page.click('text=SN002-IPHONE-2024');

        // Confirm selection
        await page.click('button:has-text("Add to Invoice")');

        // Verify 2 items are added
        await expect(page.locator('text=Quantity: 2')).toBeVisible();

        // Proceed to review step
        await page.click('button:has-text("Next")');

        // STEP 5: Set Custom VAT Rate
        console.log('Step 5: Setting custom VAT rate...');

        await page.fill('input[name="vatRate"]', '10');

        // Verify calculations
        const subtotal = await page.locator('text=/Subtotal.*AED 11,000.00/').textContent();
        expect(subtotal).toContain('11,000.00'); // 2 items * 5500

        const vat = await page.locator('text=/VAT.*AED 1,100.00/').textContent();
        expect(vat).toContain('1,100.00'); // 10% of 11,000

        const total = await page.locator('text=/Total.*AED 12,100.00/').textContent();
        expect(total).toContain('12,100.00');

        // STEP 6: Create Invoice
        console.log('Step 6: Creating invoice...');

        await page.click('button:has-text("Create Invoice")');

        // Wait for success and redirect
        await expect(page.locator('text=Invoice created successfully')).toBeVisible({ timeout: 10000 });

        // Verify redirect to invoice details
        await page.waitForURL('**/invoices/**', { timeout: 5000 });

        // STEP 7: Verify Invoice Details
        console.log('Step 7: Verifying invoice details...');

        // Verify serialized items are shown
        await expect(page.locator('text=SN001-IPHONE-2024')).toBeVisible();
        await expect(page.locator('text=SN002-IPHONE-2024')).toBeVisible();

        // Verify VAT rate
        await expect(page.locator('text=/VAT.*10%/')).toBeVisible();

        // Verify total
        await expect(page.locator('text=/Total.*12,100.00/')).toBeVisible();

        console.log('✅ E2E Test Passed: Invoice created successfully with serialized products and custom VAT!');
    });

    test('should prevent invoice creation without customer', async ({ page }) => {
        await page.goto('http://localhost:5173/invoices/create');

        // Try to proceed without selecting customer
        await page.click('button:has-text("Next")');

        // Should show error
        await expect(page.locator('text=Please select or register a customer')).toBeVisible();
    });

    test('should prevent invoice creation without products', async ({ page }) => {
        await page.goto('http://localhost:5173/invoices/create');

        // Select customer
        await page.fill('input[placeholder*="Search customer"]', '+971501234567');
        await page.waitForTimeout(500);
        await page.click('text=Test Customer');

        // Proceed to products
        await page.click('button:has-text("Next")');

        // Try to proceed without adding products
        await page.click('button:has-text("Next")');

        // Should show error
        await expect(page.locator('text=Please add at least one product')).toBeVisible();
    });
});

/**
 * Manual Test Checklist (if automated tests are not available)
 * 
 * Backend Verification:
 * □ 1. Start backend API: `cd d:\Dev\Git\SynaptriX.SIMS\SynaptriX.SIMS.API && dotnet run`
 * □ 2. Verify API is running on http://localhost:5000
 * □ 3. Check Swagger UI at http://localhost:5000/swagger
 * 
 * Frontend Verification:
 * □ 4. Start frontend: `cd d:\Dev\Git\SynaptriX.SIMS.Web && npm run dev`
 * □ 5. Open browser to http://localhost:5173
 * □ 6. Login with test credentials
 * 
 * Product Creation:
 * □ 7. Navigate to Products page
 * □ 8. Click "Add Product"
 * □ 9. Fill in product details (name, prices, etc.)
 * □ 10. Enable "Serialized Product" toggle
 * □ 11. Add at least 3 serialized items with Serial Number and IMEI
 * □ 12. Save product and verify it appears in the list
 * 
 * Invoice Creation:
 * □ 13. Navigate to Invoices → Create Invoice
 * □ 14. Select or create a customer
 * □ 15. Click "Next" to proceed to products
 * □ 16. Search for the serialized product
 * □ 17. Click on the product to open serialized item selection modal
 * □ 18. Select 2 specific items from the list
 * □ 19. Verify quantity shows as 2
 * □ 20. Click "Next" to proceed to review
 * □ 21. Change VAT rate from 5% to 10%
 * □ 22. Verify calculations update correctly
 * □ 23. Click "Create Invoice"
 * □ 24. Verify success message appears
 * □ 25. Verify redirect to invoice details page
 * 
 * Invoice Verification:
 * □ 26. Verify invoice shows correct customer information
 * □ 27. Verify invoice shows 2 items with correct serial numbers
 * □ 28. Verify VAT is calculated at 10%
 * □ 29. Verify total amount is correct
 * □ 30. Open browser DevTools → Network tab
 * □ 31. Check the POST request to /api/invoices
 * □ 32. Verify request payload includes:
 *       - customerId
 *       - items array with productId, quantity, productItemIds
 *       - vatRate: 10
 * □ 33. Check response includes created invoice with ID
 * 
 * Database Verification (Optional):
 * □ 34. Open database management tool
 * □ 35. Query Invoices table for the new invoice
 * □ 36. Verify VatRate column = 10
 * □ 37. Query InvoiceItems table
 * □ 38. Verify 2 items exist for the invoice
 * □ 39. Query ProductItems table
 * □ 40. Verify the 2 selected items have InvoiceItemId set
 * □ 41. Verify their Status is "Sold"
 */
