import React, { Component } from 'react';
import StoreFront from '../build/contracts/StoreFront.json';
import Web3 from 'web3';
import getWeb3 from './utils/getWeb3';
import contract from 'truffle-contract';

import './css/oswald.css';
import './css/open-sans.css';
import './css/pure-min.css';
import './App.css';

class AccountMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.handleChange = this.props.handleChange.bind(this);
  }
  generateAccountOptions() {
    if (this.props)
      return this.props.users.map(account => (
        <option key={account} value={account}>
          {account}
        </option>
      ));
  }
  render() {
    return (
      <div>
        <h2>User Menu</h2>
        <p>Please start by selecting an account</p>
        <select onChange={this.handleChange}>
          {this.generateAccountOptions()}
        </select>
        <p>Balance: </p>
        Purchases
        <ul>
          <li>Tennis Racket</li>
        </ul>
      </div>
    );
  }
}

class StoreMenu extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div>
        <select>
          <option>Tennis Racket</option>
        </select>
        <p>Price</p>
        <button>Buy</button>
      </div>
    );
  }
}

class OwnerMenu extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div>
        <h2>Owner Menu</h2>
        <select>
          <option>accounts here </option>
        </select>
      </div>
    );
  }
}
class AdminMenu extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div>
        <h2> Admin Menu</h2>
        <p>Add Item</p>
        <form placeholder="Item Name" />
      </div>
    );
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      web3: null,
      allAccounts: [],
      currentAccount: ''
    };
  }

  componentDidMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
      .then(results => {
        this.setState({
          web3: results.web3
        });

        this.getNetworkAccounts();

        // Instantiate contract once web3 provided.
        //this.instantiateContract();
      })
      .catch(() => {
        console.log('Error finding web3.');
      });
  }

  getNetworkAccounts() {
    this.state.web3.eth.getAccounts((error, accounts) => {
      this.setState({ allAccounts: accounts });
    });
  }

  handleAccountChange(option) {
    this.setState({ currentAccount: option.target.value });
  }

  instantiateContract() {
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */
    const storeFront = contract(StoreFront);
    storeFront.setProvider(this.state.web3.currentProvider);
  }

  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
          <a href="#" className="pure-menu-heading pure-menu-link">
            Spopify
          </a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h1>Welcome to Spopify</h1>
              <p>
                This is meant as a basic UI to the Solidity contracts composed
                for B9 Lab
              </p>
              <AccountMenu
                users={this.state.allAccounts}
                handleChange={this.handleAccountChange}
              />
              <OwnerMenu />
              <AdminMenu />
              <h2>Sales Menu</h2>
              <StoreMenu />
            </div>
          </div>
        </main>
      </div>
    );
  }
}
export default App;
