var StoreFront = artifacts.require('./StoreFront.sol');
var eventUtil = require('../eventUtil');

contract('StoreFront', accounts => {
  const contractOwner = accounts[0];
  const accountA = accounts[1];
  const accountB = accounts[2];

  it('should let a user add themself, then the owner should promote them', async () => {
    let contract = await StoreFront.deployed();
    await contract.addUser('Bob', {
      from: accountA,
      value: 5000000
    });
    try {
      await eventUtil.assertEvent(contract, {
        event: 'LogAddUser'
      });
    } catch (err) {
      console.log(err);
      assert.fail(err);
    }
    await contract.promoteToAdmin(accountA, { from: contractOwner });
    try {
      await eventUtil.assertEvent(contract, { event: 'LogPromoteToAdmin' });
    } catch (err) {
      console.log(err);
      assert.fail(err);
    }
  });

  it('should let a user add themself, then deposit to their account', async () => {
    let contract = await StoreFront.deployed();
    await contract.addUser('Sarah', {
      from: accountB,
      value: 5000000
    });

    await contract.deposit({ from: accountB, value: 5000000 });
    try {
      await eventUtil.assertEvent(contract, {
        event: 'LogDeposit'
      });
    } catch (err) {
      console.log(err);
      assert.fail(err);
    }

    let info = await contract.getInfo(accountB);
    let balance = info[1].toString();
    assert.equal(balance, '10000000', 'Sarah balance should be 10,000,0000');
  });

  it('should let a store admin add some items', async () => {
    let contract = await StoreFront.deployed();
    await contract.addProduct(123, 'UFO Llama Cat T-shirt', 500, 10, {
      from: accountA
    });
    try {
      await eventUtil.assertEvent(contract, {
        event: 'LogAddProduct'
      });
    } catch (err) {
      console.log(err);
      assert.fail(err);
    }
    let item = await contract.getProduct(123);
    assert.equal(
      item[0],
      accountA,
      'Bob should be selling the UFO Llama Cat T-Shirt'
    );
    assert.equal(item[1], 500, 'The UFO Llama Cat T-Shirt should be 500 wei');
    assert.equal(item[2], 10, 'There should be 10 t-shirts stocked');

    contract.addProduct(456, 'Hard Fork Cafe T-Shirt', 100, 5, {
      from: accountA
    });
    contract.addProduct(789, 'Fighter Kitten T-Shirt', 600, 12, {
      from: accountA
    });
  });

  it('should let a user buy an item', async () => {
    let contract = await StoreFront.deployed();
    await contract.purchase(123, 1, { from: accountB });
    try {
      await eventUtil.assertEvent(contract, {
        event: 'LogPurchase'
      });
    } catch (err) {
      console.log(err);
      assert.fail(err);
    }
    let info = await contract.getInfo(accountB);
    let balance = info[1].toString();
    assert.equal(balance, '9999500', 'Sarah balance should be 9,999,500');
  });

  it('should let a user make a withdrawal', async () => {
    let contract = await StoreFront.deployed();
    await contract.withdraw({ from: accountB });
    try {
      eventUtil.assertEvent(contract, {
        event: 'LogWithdraw'
      });
    } catch (err) {
      console.log(err);
      assert.fail(err);
    }
    let info = await contract.getInfo(accountB);
    assert.equal(info[0], 'Sarah', 'Should return Sarah info');
    assert.equal(info[1], 0, 'Sarah balance should be empty');
  });
});
