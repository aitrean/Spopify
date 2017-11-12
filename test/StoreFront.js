var StoreFront = artifacts.require('./StoreFront.sol');
import expectThrow from '../zeppelin-helpers/expectThrow';

function bytesToString(input) {
  let output = web3.toHex(input);
  return web3.toUtf8(output);
}

contract('StoreFront', accounts => {
  const contractOwner = accounts[0];
  const accountA = accounts[1];
  const accountB = accounts[2];

  beforeEach(() => {
    return StoreFront.new({ from: contractOwner })
      .then(instance => (contract = instance))
      .then(() => contract.addUser('Bob', { from: accountA }))
      .then(() => contract.addUser('Sarah', { from: accountB, value: 5 }))
      .then(() => {
        contract.promoteToAdmin(accountA);
      });
  });

  it('should properly keep the merchandise data updated', async () => {
    //test add product
    let txObj = await contract.addProduct(123, 'UFO Llama Cat T-shirt', 5, 10, {
      from: accountA
    });
    assert.equal(
      txObj.logs[0].args.productOwner,
      accountA,
      'accountA should be the owner of this product'
    );
    assert.equal(txObj.logs[0].args.id, 123, 'the product ID should be 123');

    let productObj = await contract.getProduct(123);
    assert.equal(
      bytesToString(productObj[0]),
      'UFO Llama Cat T-shirt',
      'product id 123 should map to UFO Llama Cat T-shirt'
    );
  });

  it('should allow users to make deposits and withdrawals appropriately', async () => {
    let txObj = await contract.deposit({ value: 500, from: accountB });
    assert.equal(
      txObj.logs[0].args.amount,
      500,
      'deposit event should indicate Sarah deposited 500 wei'
    );

    let userInfo = await contract.getInfo(accountB);
    assert.equal(
      userInfo[1].toString(),
      '505',
      'Sarah should have a balance of 500 wei'
    );

    txObj = await contract.withdraw({ from: accountB });
    assert.equal(
      txObj.logs[0].args.amount.toString(),
      '505',
      'withdraw event should indicate Sarah withdrew 500 wei'
    );

    userInfo = await contract.getInfo(accountB);
    assert.equal(
      userInfo[1].toString(),
      '0',
      'Sarah should have a balance of 0 wei'
    );
  });

  it('should allow users to make purchases appropriately', async () => {
    await contract.addProduct(456, 'Hard Fork Cafe T-shirt', 12, 3, {
      from: accountA
    });

    let txObj = await contract.purchase(456, 1, {
      from: accountB,
      value: 7
    });
    assert.equal(
      txObj.logs[1].args.id,
      456,
      'Purchase event should be emitted after successful purchase'
    );

    //try purchasing the shirt without sufficient wei
    await expectThrow(contract.purchase(456, 1, { from: accountB, value: 3 }));
  });
});
