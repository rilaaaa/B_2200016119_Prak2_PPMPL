const PrimaryRepository = require('./repository'); // pastikan path benar
const SecondaryRepository = require('./secondaryRepository'); // pastikan path benar

class Service {
  constructor() {
    this.primaryRepository = new PrimaryRepository();
    this.secondaryRepository = new SecondaryRepository();
  }

  getItemById(id) {
    let item = this.primaryRepository.getItemById(id);
    if (!item) {
      item = this.secondaryRepository.getItemById(id);
    }
    if (!item) {
      throw new Error('Item not found in both repositories');
    }
    return item;
  }

  deleteItemById(id) {
    let item = this.primaryRepository.deleteItemById(id);
    if (!item) {
      item = this.secondaryRepository.deleteItemById(id);
    }
    if (!item) {
      throw new Error('Item not found'); // Menghandle error jika item tidak ditemukan di kedua repository
    }
    return item;
  }
}

module.exports = Service;