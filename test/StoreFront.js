var StoreFront = artifacts.require('./StoreFront.sol')
var eventUtil = require('../eventUtil')

contract('StoreFront', accounts => {
	const contractOwner = accounts[0]
	const accountA = accounts[1]
	const accountB = accounts[2]

	beforeEach(() => {
		return StoreFront.new({ from: contractOwner }).then(instance => contract = instance)
	})

	it('should let a user add themself, then the owner should promote them', () => {
		return contract.addUser('Bob', { from: accountA }).then(() => {
			eventUtil.assertEvent(contract, { event: 'LogAddUser' });
		}).catch((err) => {
			console.log(err)
			assert.fail(err)
		}).then(() => {
			contract.promoteToAdmin(accountA)
		}).then(() => {
			eventUtil.assertEvent(contract, { event: 'LogPromoteToAdmin' });
		})
	})
})
