pragma solidity ^0.4.11;

import '../node_modules/zeppelin-solidity/contracts/math/SafeMath.sol';

contract StoreFront {
    using SafeMath for uint;
    struct Product {
        address owner;
        bytes32 name;
        uint price;
        uint quantity;
        bool initialized;
    }
    struct User {
        bytes32 name;
        uint balance;
        bool administrationAccess;
        bool initialized;
        mapping(uint=>Product) shoppingBasket;
    }
    address owner;
    uint[] public productIds;
    mapping(address=>User) users;
    mapping(uint=>Product) products;

    event LogPromoteToAdmin(address indexed promoterAddress, address indexed administratorAddress);
    event LogAddUser(address indexed userAddress, bytes32 indexed name, uint balance);
    event LogAddProduct(address indexed productOwner, uint indexed id, uint price, uint quantity);
    event LogAddStock(address indexed adminAddress, uint indexed id, uint quantity);
    event LogUserInfo(bytes32 indexed name, uint balance, bool administrationAccess, bool initialized);
    event LogDeposit(address indexed userAddress, uint amount);
    event LogWithdraw(address indexed userAddress, uint amount);
    event LogPurchase(uint indexed id, address indexed userAddress, uint quantity);

    modifier isAdministrator {
        require(users[msg.sender].administrationAccess);
        _;
    }
    
    modifier isUser {
        require(users[msg.sender].initialized);
        _;
    }
    
    modifier isOwner {
        require(msg.sender == owner);
        _;
    }
    
    function StoreFront() public {
        owner = msg.sender;
    }

    function promoteToAdmin(address administratorAddress) isOwner() public returns (bool) {
        if(users[administratorAddress].initialized && !users[administratorAddress].administrationAccess) {
            LogPromoteToAdmin(msg.sender, administratorAddress);
            users[administratorAddress].administrationAccess = true; 
            return true;
        }
        revert();
    }
    
    function addUser(bytes32 name) public payable {
        require(!users[msg.sender].initialized);
        LogAddUser(msg.sender, name, msg.value);
        users[msg.sender] = User(name, msg.value, false, true);
    }
    
    function addProduct(uint id, bytes32 name, uint price, uint quantity) isAdministrator() public returns (bool) {
        require(!products[id].initialized);
        LogAddProduct(msg.sender, id, price, quantity);
        productIds.push(id);
        products[id] = Product(msg.sender, name, price, quantity, true);
        return true;
    }
    
    function addStock(uint id, uint quantity) isAdministrator() public {
        require(products[id].initialized);
        LogAddStock(msg.sender, id, quantity);
        products[id].quantity = products[id].quantity.add(quantity);
    }
    
    function purchase(uint id, uint quantity) isUser() public payable returns (bool) {
        require(products[id].initialized && products[id].quantity >= quantity);
        //if the user sends ether with their purchase, deposit it first
        if(msg.value > 0) {
            deposit();
        }

        //make the payment
        if ((quantity * products[id].price) > users[msg.sender].balance) {
            revert();
        } 
        //add the product to the user shopping basket
        LogPurchase(id, msg.sender, quantity);
        users[msg.sender].balance = users[msg.sender].balance.sub((quantity * products[id].price));
        products[id].quantity = products[id].quantity.sub(quantity);

        if (users[msg.sender].shoppingBasket[id].initialized) {
            users[msg.sender].shoppingBasket[id].quantity = users[msg.sender].shoppingBasket[id].quantity.add(quantity);
        } else {
            users[msg.sender].shoppingBasket[id] = Product(msg.sender, products[id].name, products[id].price, quantity, true);
        }
        return true;
    }
    
    function withdraw() public {
        require(users[msg.sender].initialized);
        uint sendAmount = users[msg.sender].balance;
        users[msg.sender].balance = 0;
        LogWithdraw(msg.sender, sendAmount);
        msg.sender.transfer(sendAmount);
    }
    
    function deposit() public payable isUser() {
        LogDeposit(msg.sender, msg.value);
        users[msg.sender].balance = users[msg.sender].balance.add(msg.value);
    }

    function getInfo(address userAddress) public constant returns (bytes32, uint) {
        return (users[userAddress].name, users[userAddress].balance);
    }

    function getProduct(uint id) public constant returns (bytes32, address, uint, uint) {
        if(!products[id].initialized) {
            return;
        }
        return (products[id].name, products[id].owner, products[id].price, products[id].quantity);
    }
    
    function() public {
        revert();
    }
}