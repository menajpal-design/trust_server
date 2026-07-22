const { AsyncLocalStorage } = require('async_hooks');

const tenantStorage = new AsyncLocalStorage();

const runWithTenantContext = (tenantId, callback) => {
  return tenantStorage.run({ tenantId }, callback);
};

const getTenantContext = () => {
  const store = tenantStorage.getStore();
  return store ? store.tenantId : null;
};

module.exports = {
  runWithTenantContext,
  getTenantContext
};
