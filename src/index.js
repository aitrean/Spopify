import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import getWeb3 from './utils/getWeb3';
import contract from 'truffle-contract';
import StoreFront from '../build/contracts/StoreFront.json';

function composeWeb3() {
  /*
   * SMART CONTRACT EXAMPLE
   *
   * Normally these functions would be called in the context of a
   * state management library, but for convenience I've placed them here.
   */
  getWeb3
    .then(results => {
      const web3 = results.web3;
      getNetworkAccounts(web3);
      // Instantiate contract once web3 provided.
    })
    .catch(() => {
      console.log('Error finding web3.');
    }); 
}

function getNetworkAccounts(web3) {
  web3.eth.getAccounts((error, accounts) => {
    instantiateContract(web3, accounts);
  });
}

function instantiateContract(web3, accounts) {
  const storeFront = contract(StoreFront);
  storeFront.setProvider(web3.currentProvider);
  storeFront.deployed().then(instance => {
    getOwner(web3, accounts, instance);
  });
}

function getOwner(web3, accounts, instance) {
  instance.owner().then(address => {
    renderApp(web3, accounts, instance, address);
  });
}

function renderApp(web3, accounts, instance, owner) {
  ReactDOM.render(
    <App web3={web3} accounts={accounts} owner={owner} contract={instance} />,
    document.getElementById('root')
  );
}

composeWeb3();
