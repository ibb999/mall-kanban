// 数据存储层 (支持内存模式和MongoDB模式，统一async接口)
class InMemoryStore {
  constructor() {
    this.entry = [];
    this.exitStore = [];
    this.operationLogs = [];
    this.nextId = 1;
  }

  async getAll(type) {
    if (type === 'entry') return [...this.entry];
    if (type === 'exitStore') return [...this.exitStore];
    if (type === 'operationLog') return [...this.operationLogs].sort((a, b) => b.id - a.id);
    return [];
  }

  async findById(type, id) {
    const numId = Number(id);
    if (type === 'entry') {
      const item = this.entry.find(item => item.id === numId);
      return item ? { ...item } : undefined;
    }
    if (type === 'exitStore') {
      const item = this.exitStore.find(item => item.id === numId);
      return item ? { ...item } : undefined;
    }
    return undefined;
  }

  async create(type, data) {
    const id = this.nextId++;
    const newItem = { id, ...data };
    if (type === 'entry') {
      this.entry.push(newItem);
    } else if (type === 'exitStore') {
      this.exitStore.push(newItem);
    }
    return { ...newItem };
  }

  async updateById(type, id, updates) {
    const numId = Number(id);
    const items = type === 'entry' ? this.entry : this.exitStore;
    const index = items.findIndex(item => item.id === numId);
    if (index === -1) return undefined;
    const oldItem = { ...items[index] };
    items[index] = { ...oldItem, ...updates };
    return { ...items[index] };
  }

  async deleteById(type, id) {
    const numId = Number(id);
    const items = type === 'entry' ? this.entry : this.exitStore;
    const index = items.findIndex(item => item.id === numId);
    if (index === -1) return false;
    items.splice(index, 1);
    return true;
  }

  async addOperationLog(log) {
    const id = this.nextId++;
    this.operationLogs.push({ id, ...log });
    return { id, ...log };
  }
}

module.exports = new InMemoryStore();
