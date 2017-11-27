import getWeb3 from './getWeb3';
import contract from 'truffle-contract';
import StoreFront from '../../build/contracts/StoreFront.json';
import Web3 from 'web3';

class API {
  web3;
  storeFront;
  address;
  accounts;
  constructor() {
    this.instantiateContract();
  }

  setAccount(address) {
    this.address = address;
  }

  instantiateContract() {
    return new Promise(resolve => {
      getWeb3.then(results => {
        this.web3 = results.web3;
        this.storeFront = contract(StoreFront);
        this.storeFront.setProvider(this.web3.currentProvider);
        console.log('ayyyyyyy lmao');
        console.log(results);
        resolve();
      });
    });
  }

  getAccounts() {
    if (this.web3 === undefined) {
      this.instantiateContract().then(() => {
        console.log('ayyy YYYYY lmao');
        this.web3.eth.getAccounts((error, accounts) => {
          return accounts;
        });
      });
    }
    console.log('ayo le mayo');
    console.log(this.web3);
    this.web3.eth.getAccounts((error, accounts) => {
      return accounts;
    });
  }

  wrapTx({ methodName, params, txObj = null }) {
    return this.storeFront[methodName]({
      from: this.address,
      gas: 200000
    }).apply(params);
  }
}
export default new API();
