I have analyzed the current codebase and confirmed that the **CRUD implementation** (Controllers, Services, Repositories, Routes) and **Database Schema** (including complex triggers for balance updates) are already in place for all entities (`income_types`, `expense_types`, `accounts`, `transfers`, etc.).

However, the project is missing the critical "Comprehensive" components you requested: **Unit/Integration Tests** and **API Documentation**.

My plan is to verify the existing logic, add the missing testing infrastructure, and implement the documentation and tests as requested.

### **Phase 1: Infrastructure Setup**
1.  **Install Dependencies**:
    *   Testing: `jest`, `ts-jest`, `supertest`, `@types/jest`, `@types/supertest`.
    *   Documentation: `swagger-jsdoc`, `swagger-ui-express`.
2.  **Configure Testing**:
    *   Create `jest.config.js` for TypeScript support.
    *   Create `tests/setup.ts` for test environment configuration.
3.  **Configure Documentation**:
    *   Create `src/config/swagger.ts` to define the OpenAPI specification.
    *   Update `src/app.ts` to mount Swagger UI at `/api-docs`.

### **Phase 2: Income & Expense Types (Priority)**
1.  **Verification**: Review `src/validators` to ensure strict server-side validation (e.g., non-empty names, valid UUIDs) matches your requirements.
2.  **Documentation**: Add OpenAPI/Swagger annotations (JSDoc) to `src/routes/income.routes.ts` and `src/routes/expense.routes.ts`.
3.  **Unit Tests**:
    *   Create `tests/unit/services/income.service.test.ts` and `expense.service.test.ts`.
    *   Achieve >80% coverage by mocking repositories and testing business logic (e.g., ensuring validation errors are thrown).
4.  **Integration Tests**:
    *   Create `tests/integration/routes/income.routes.test.ts` and `expense.routes.test.ts`.
    *   Use `supertest` to verify HTTP status codes (200, 201, 400, 401) and response structures.

### **Phase 3: Remaining Tables (Accounts, Transfers, Subscriptions)**
1.  **Documentation**: Add Swagger annotations to the remaining route files.
2.  **Tests**: Implement unit and integration tests for `Account`, `Transfer`, and `Subscription` services/routes, ensuring the complex trigger logic (like balance updates) is verified via integration tests or mocked appropriately.

### **Phase 4: Final Verification**
1.  **Run All Tests**: Execute `npm test` to confirm >80% coverage.
2.  **Verify Docs**: Ensure `/api-docs` renders the full interactive API documentation.
