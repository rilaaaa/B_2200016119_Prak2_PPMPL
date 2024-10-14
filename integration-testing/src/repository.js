const sinon = require('sinon');
const { expect } = require('chai');
const Service = require('../src/service');
const PrimaryRepository = require('../src/repository');
const SecondaryRepository = require('../src/secondaryRepository');

describe('Service Integration Tests', () => {
  let service;
  let primaryRepositoryStub;
  let secondaryRepositoryStub;

  beforeEach(() => {
    primaryRepositoryStub = sinon.createStubInstance(PrimaryRepository);
    secondaryRepositoryStub = sinon.createStubInstance(SecondaryRepository);
  
    // Explicitly stub deleteItemById for both repositories
    primaryRepositoryStub.deleteItemById = sinon.stub();
    secondaryRepositoryStub.deleteItemById = sinon.stub();
  
    service = new Service();
    service.primaryRepository = primaryRepositoryStub;
    service.secondaryRepository = secondaryRepositoryStub;
  });

  it('should delete item from primary repository', () => {
    const item = { id: 1, name: 'Item 1' };
    primaryRepositoryStub.deleteItemById.withArgs(1).returns(item);
  
    const result = service.deleteItemById(1);
  
    expect(result).to.equal(item);
    expect(primaryRepositoryStub.deleteItemById.calledOnceWith(1)).to.be.true;
    expect(secondaryRepositoryStub.deleteItemById.notCalled).to.be.true;
  });
  
  it('should delete item from secondary repository if not found in primary', () => {
    primaryRepositoryStub.deleteItemById.withArgs(2).returns(null); // not found in primary
    const item = { id: 2, name: 'Item 2' };
    secondaryRepositoryStub.deleteItemById.withArgs(2).returns(item);
  
    const result = service.deleteItemById(2);
  
    expect(result).to.equal(item);
    expect(primaryRepositoryStub.deleteItemById.calledOnceWith(2)).to.be.true;
    expect(secondaryRepositoryStub.deleteItemById.calledOnceWith(2)).to.be.true;
  });
  
  it('should throw an error when deleting an item that is not found in both repositories', () => {
    primaryRepositoryStub.deleteItemById.returns(null); // not found in primary
    secondaryRepositoryStub.deleteItemById.returns(null); // not found in secondary
  
    expect(() => service.deleteItemById(3)).to.throw('Item not found');
    expect(primaryRepositoryStub.deleteItemById.calledOnceWith(3)).to.be.true;
    expect(secondaryRepositoryStub.deleteItemById.calledOnceWith(3)).to.be.true;
  });
});
