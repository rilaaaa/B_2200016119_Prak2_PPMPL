const sinon = require("sinon");
const { expect } = require("chai");
const Service = require("../src/service");
const PrimaryRepository = require("../src/repository");
const SecondaryRepository = require("../src/secondaryRepository");

describe("Service Integration Tests with Multiple Stubs", () => {
  let service;
  let primaryRepositoryStub;
  let secondaryRepositoryStub;

  beforeEach(() => {
    primaryRepositoryStub = sinon.createStubInstance(PrimaryRepository);
    secondaryRepositoryStub = sinon.createStubInstance(SecondaryRepository);
    service = new Service();
    service.primaryRepository = primaryRepositoryStub;
    service.secondaryRepository = secondaryRepositoryStub;
    service.data = [
      // Setup initial data for removeItemById tests
      { id: 1, name: "Item 1" },
      { id: 2, name: "Item 2" },
      { id: 3, name: "Item 3" },
    ];
  });

  it("should return item from primary repository if found", () => {
    const item = { id: 1, name: "Item 1" };
    primaryRepositoryStub.getItemById.withArgs(1).returns(item);

    const result = service.getItemById(1);
    expect(result).to.equal(item);
    expect(primaryRepositoryStub.getItemById.calledOnceWith(1)).to.be.true;
    expect(secondaryRepositoryStub.getItemById.notCalled).to.be.true;
  });

  it("should return item from secondary repository if not found in primary", () => {
    primaryRepositoryStub.getItemById.withArgs(3).returns(null);
    const item = { id: 3, name: "Item 3" };
    secondaryRepositoryStub.getItemById.withArgs(3).returns(item);

    const result = service.getItemById(3);
    expect(result).to.equal(item);
    expect(primaryRepositoryStub.getItemById.calledOnceWith(3)).to.be.true;
    expect(secondaryRepositoryStub.getItemById.calledOnceWith(3)).to.be.true;
  });

  it("should throw an error if item is not found in both repositories", () => {
    primaryRepositoryStub.getItemById.returns(null);
    secondaryRepositoryStub.getItemById.returns(null);

    expect(() => service.getItemById(5)).to.throw(
      "Item not found in both repositories"
    );
    expect(primaryRepositoryStub.getItemById.calledOnceWith(5)).to.be.true;
    expect(secondaryRepositoryStub.getItemById.calledOnceWith(5)).to.be.true;
  });

  // Tests for removeItemById
  it("should remove item by id and return it", () => {
    const result = service.removeItemById(2);
    expect(result).to.deep.equal({ id: 2, name: "Item 2" });
    expect(service.data).to.have.lengthOf(2);
    expect(service.data).to.not.include({ id: 2, name: "Item 2" });
  });

  it("should return null if item is not found", () => {
    const result = service.removeItemById(4);
    expect(result).to.be.null;
    expect(service.data).to.have.lengthOf(3); // No items should be removed
  });

  it("should remove the correct item when multiple items have the same name", () => {
    service.data.push({ id: 4, name: "Item 2" }); // Adding duplicate name with different ID
    const result = service.removeItemById(2);
    expect(result).to.deep.equal({ id: 2, name: "Item 2" });
    expect(service.data).to.have.lengthOf(3); // Ensure only one item is removed
    expect(service.data).to.not.include({ id: 2, name: "Item 2" });
  });
});
