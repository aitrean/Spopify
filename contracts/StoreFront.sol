pragma solidity ^0.4.11;

contract StoreFront {
    struct Product {
        address owner;
        string name;
        uint price;
        uint quantity;
        bool initialized;
    }
    struct User {
        string name;
        uint balance;
        bool administrationAccess;
        bool initialized;
        mapping(bytes32=>Product) shoppingBasket;
    }
    address owner;
    bytes32[] public productIds;
    mapping(address=>User) users;
    mapping(bytes32=>Product) products;

    event LogPromoteToAdmin(address administratorAddress);
    event LogAddUser(address userAddress, string name, uint balance);
    event LogAddProduct(address productOwner, bytes32 id, uint price, uint quantity);
    event LogAddStock(address adminAddress, bytes32 id, uint quantity);
    event LogUserInfo(string name, uint balance, bool administrationAccess, bool initialized);
    event LogDeposit(address user, uint amount);
    event LogWithdraw(address user, uint amount);
    event LogPurchase(address user, bytes32 id, string name, uint quantity);

    modifier isAdministrator() {
        require(users[msg.sender].administrationAccess == true);
        _;
    }
    
    modifier isUser() {
        require(users[msg.sender].initialized);
        _;
    }
    
    modifier isOwner() {
        require(msg.sender == owner);
        _;
    }
    
    function StoreFront() public {
        owner = msg.sender;
    }

    function promoteToAdmin(address administratorAddress) isOwner() public returns (bool) {
        if(users[administratorAddress].initialized) {
            LogPromoteToAdmin(administratorAddress);
            users[administratorAddress].administrationAccess = true; 
            return true;
        }
        return false;
    }
    
    function addUser(string name) public payable {
        require(!users[msg.sender].initialized);
        LogAddUser(msg.sender, name, msg.value);
        users[msg.sender] = User(name, msg.value, false, true);
    }
    
    function addProduct(bytes32 id, string name, uint price, uint quantity) isAdministrator() public returns (bool) {
        require(!products[id].initialized);
        LogAddProduct(msg.sender, id, price, quantity);
        productIds.push(id);
        products[id] = Product(msg.sender, name, price, quantity, true);
        return true;
    }
    
    function addStock(uint quantity, bytes32 id) isAdministrator() public {
        require(products[id].initialized);
        LogAddStock(msg.sender, id, quantity);
        products[id].quantity += quantity;
    }
    
    function purchase(bytes32 id, uint quantity) isUser() public returns (bool) {
        require(products[id].initialized && products[id].quantity > 0);
        //make the payment
        
        if ((quantity * products[id].price) > users[msg.sender].balance) {
            return false;
        } 
        //add the product to the user shopping basket
        LogPurchase(msg.sender, id, products[id].name, quantity);
        users[msg.sender].balance -= (quantity * products[id].price);
        products[id].quantity -= quantity;

        if (users[msg.sender].shoppingBasket[id].initialized) {
            users[msg.sender].shoppingBasket[id].quantity += quantity;
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
        users[msg.sender].balance += msg.value;
    }

    function getInfo(address userAddress) public constant returns (string, uint) {
        return (users[userAddress].name, users[userAddress].balance);
    }

    function getProduct(bytes32 id) public constant returns (address, uint, uint) {
        require(products[id].initialized);
        return (products[id].owner, products[id].price, products[id].quantity);
    }
    
    function() public {
        revert();
    }
}